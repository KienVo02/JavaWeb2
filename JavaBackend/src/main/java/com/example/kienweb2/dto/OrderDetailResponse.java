package com.example.kienweb2.dto;

import java.math.BigDecimal;

public record OrderDetailResponse(
        Long id,
        Long productId,
        String productName,
        String productImageUrl,
        String sizeName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice
) {
}
