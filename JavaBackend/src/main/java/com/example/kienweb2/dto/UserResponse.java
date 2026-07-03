package com.example.kienweb2.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String status,
        LocalDateTime createdAt
) {
}
