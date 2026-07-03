package com.example.kienweb2.dto;

public record OrderItemRequest(Long productId, String sizeName, Integer quantity) {
}
