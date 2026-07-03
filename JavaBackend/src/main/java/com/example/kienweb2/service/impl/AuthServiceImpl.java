package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.AuthResponse;
import com.example.kienweb2.dto.LoginRequest;
import com.example.kienweb2.dto.UserResponse;
import com.example.kienweb2.entity.User;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.UserRepository;
import com.example.kienweb2.service.AuthService;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (!hasText(request.email()) || !hasText(request.password())) {
            throw new BadRequestException("Email va mat khau khong duoc de trong.");
        }

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email hoac mat khau khong dung."));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Tai khoan dang bi khoa.");
        }
        if (!request.password().equals(user.getPassword())) {
            throw new BadRequestException("Email hoac mat khau khong dung.");
        }

        user.setAuthToken(UUID.randomUUID().toString());
        User savedUser = userRepository.save(user);
        return new AuthResponse(savedUser.getAuthToken(), toResponse(savedUser));
    }

    @Override
    public UserResponse me(String authorizationHeader) {
        return toResponse(requireUserByToken(resolveToken(authorizationHeader)));
    }

    @Override
    @Transactional
    public void logout(String authorizationHeader) {
        String token = resolveToken(authorizationHeader);
        User user = requireUserByToken(token);
        user.setAuthToken(null);
        userRepository.save(user);
    }

    @Override
    public User requireUserByToken(String token) {
        if (!hasText(token)) {
            throw new BadRequestException("Chua dang nhap.");
        }

        User user = userRepository.findByAuthToken(token.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Phien dang nhap khong hop le."));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Tai khoan dang bi khoa.");
        }
        return user;
    }

    private String resolveToken(String authorizationHeader) {
        if (!hasText(authorizationHeader)) {
            return "";
        }
        return authorizationHeader.replaceFirst("(?i)^Bearer\\s+", "").trim();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
