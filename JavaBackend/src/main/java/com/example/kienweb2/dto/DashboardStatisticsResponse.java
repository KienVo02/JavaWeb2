package com.example.kienweb2.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatisticsResponse(
        Long totalProducts,
        Long todayOrders,
        BigDecimal todayRevenue,
        Long newCustomers,
        Long lowStockProducts,
        List<OrderResponse> recentOrders,
        List<ProductResponse> featuredProducts,
        List<OrderStatusStat> orderStatusStats
) {
}
