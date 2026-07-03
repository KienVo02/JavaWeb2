package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.UserRequest;
import com.example.kienweb2.dto.UserResponse;
import com.example.kienweb2.entity.User;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.UserRepository;
import com.example.kienweb2.service.UserService;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final Set<String> ROLES = Set.of("USER", "EDITOR", "ADMIN");
    private static final Set<String> STATUSES = Set.of("ACTIVE", "LOCKED", "DELETED");

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findNotDeletedOrderByCreatedAtDesc("DELETED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (!hasText(request.getFullName()) || !hasText(request.getEmail()) || !hasText(request.getPassword())) {
            throw new BadRequestException("Ho ten, email va mat khau la bat buoc.");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email da ton tai.");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(request.getPassword());
        user.setRole(resolveRole(request.getRole()));
        user.setStatus(resolveStatus(request.getStatus()));
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findUser(id);
        String nextRole = hasText(request.getRole()) ? resolveRole(request.getRole()) : user.getRole();
        String nextStatus = hasText(request.getStatus()) ? resolveStatus(request.getStatus()) : user.getStatus();
        if ("ADMIN".equalsIgnoreCase(user.getRole())
                && "ACTIVE".equalsIgnoreCase(user.getStatus())
                && (!"ADMIN".equalsIgnoreCase(nextRole) || !"ACTIVE".equalsIgnoreCase(nextStatus))
                && userRepository.countByRoleIgnoreCaseAndStatusIgnoreCase("ADMIN", "ACTIVE") <= 1) {
            throw new BadRequestException("Can giu lai it nhat mot tai khoan admin hoat dong.");
        }

        if (hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }
        if (hasText(request.getEmail())) {
            String email = request.getEmail().trim().toLowerCase();
            userRepository.findByEmail(email)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new BadRequestException("Email da ton tai.");
                    });
            user.setEmail(email);
        }
        if (hasText(request.getPassword())) {
            user.setPassword(request.getPassword());
            user.setAuthToken(null);
        }
        if (hasText(request.getRole())) {
            user.setRole(nextRole);
        }
        if (hasText(request.getStatus())) {
            user.setStatus(nextStatus);
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUser(id);
        if ("ADMIN".equalsIgnoreCase(user.getRole())
                && userRepository.countByRoleIgnoreCaseAndStatusIgnoreCase("ADMIN", "ACTIVE") <= 1) {
            throw new BadRequestException("Can giu lai it nhat mot tai khoan admin hoat dong.");
        }
        user.setStatus("DELETED");
        user.setAuthToken(null);
        userRepository.save(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay tai khoan id: " + id));
    }

    private String resolveRole(String role) {
        String normalized = hasText(role) ? role.trim().toUpperCase() : "USER";
        if (!ROLES.contains(normalized)) {
            throw new BadRequestException("Vai tro khong hop le.");
        }
        return normalized;
    }

    private String resolveStatus(String status) {
        String normalized = hasText(status) ? status.trim().toUpperCase() : "ACTIVE";
        if (!STATUSES.contains(normalized)) {
            throw new BadRequestException("Trang thai tai khoan khong hop le.");
        }
        return normalized;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStatus(), user.getCreatedAt());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
