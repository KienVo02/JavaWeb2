package com.example.kienweb2.service;

import com.example.kienweb2.dto.OrderRequest;
import com.example.kienweb2.dto.OrderResponse;
import java.util.List;

public interface OrderService {

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long id);

    OrderResponse createOrder(OrderRequest request);

    OrderResponse updateOrderStatus(Long id, String status);

    void deleteOrder(Long id);
}
