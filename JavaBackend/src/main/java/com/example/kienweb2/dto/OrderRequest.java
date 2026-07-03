package com.example.kienweb2.dto;

import java.util.List;

public record OrderRequest(
        String customerName,
        String customerEmail,
        String customerPhone,
        String shippingAddress,
        String paymentMethod,
        List<OrderItemRequest> items
) {
}
