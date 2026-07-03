package com.example.kienweb2.config;

import com.example.kienweb2.entity.User;
import com.example.kienweb2.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    public AuthInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || isPublicRequest(request)) {
            return true;
        }

        User user = resolveUser(request);
        if (user == null) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Can dang nhap de thuc hien thao tac nay.");
            return false;
        }

        Set<String> allowedRoles = allowedRoles(request);
        if (!allowedRoles.contains(user.getRole().toUpperCase())) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN, "Tai khoan khong co quyen thuc hien thao tac nay.");
            return false;
        }

        request.setAttribute("currentUser", user);
        return true;
    }

    private boolean isPublicRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.startsWith("/api/v1/auth")) {
            return true;
        }
        if ("GET".equalsIgnoreCase(method)
                && (path.startsWith("/api/v1/products")
                || path.startsWith("/api/v1/categories")
                || path.startsWith("/api/v1/posts"))) {
            return true;
        }
        return "POST".equalsIgnoreCase(method) && path.equals("/api/v1/orders");
    }

    private Set<String> allowedRoles(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.startsWith("/api/v1/posts") && !"GET".equalsIgnoreCase(method)) {
            return Set.of("ADMIN", "EDITOR");
        }
        if (path.startsWith("/api/v1/uploads")) {
            return Set.of("ADMIN", "EDITOR");
        }
        return Set.of("ADMIN");
    }

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || header.isBlank()) {
            return null;
        }
        String token = header.replaceFirst("(?i)^Bearer\\s+", "").trim();
        if (token.isBlank()) {
            return null;
        }
        return userRepository.findByAuthToken(token)
                .filter(user -> "ACTIVE".equalsIgnoreCase(user.getStatus()))
                .orElse(null);
    }

    private void writeError(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"timestamp":"%s","status":%d,"message":"%s"}
                """.formatted(LocalDateTime.now(), status, escapeJson(message)));
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
