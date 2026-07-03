package com.example.kienweb2.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderCode,
        String customerName,
        String customerEmail,
        String customerPhone,
        String shippingAddress,
        BigDecimal totalAmount,
        String paymentMethod,
        String status,
        LocalDateTime orderDate,
        List<OrderDetailResponse> orderDetails
) {
}
