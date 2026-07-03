package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.DashboardStatisticsResponse;
import com.example.kienweb2.dto.OrderResponse;
import com.example.kienweb2.dto.OrderStatusStat;
import com.example.kienweb2.entity.Order;
import com.example.kienweb2.repository.CustomerRepository;
import com.example.kienweb2.repository.OrderRepository;
import com.example.kienweb2.repository.ProductRepository;
import com.example.kienweb2.service.DashboardService;
import com.example.kienweb2.service.ProductService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final int LOW_STOCK_LIMIT = 20;
    private static final String DELETED_STATUS = "DELETED";

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderServiceImpl orderService;
    private final ProductService productService;

    public DashboardServiceImpl(
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            OrderRepository orderRepository,
            OrderServiceImpl orderService,
            ProductService productService
    ) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.productService = productService;
    }

    @Override
    public DashboardStatisticsResponse getStatistics() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findNotDeletedOrderByOrderDateDesc(DELETED_STATUS);
        long totalOrders = orders.size();

        BigDecimal todayRevenue = orders.stream()
                .filter(order -> order.getOrderDate() != null
                        && !order.getOrderDate().isBefore(startOfDay)
                        && !order.getOrderDate().isAfter(endOfDay)
                        && !"Đã hủy".equalsIgnoreCase(order.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<OrderResponse> recentOrders = orderRepository.findRecentNotDeleted(DELETED_STATUS, org.springframework.data.domain.PageRequest.of(0, 5))
                .stream()
                .map(order -> orderService.getOrderById(order.getId()))
                .toList();

        Map<String, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        List<OrderStatusStat> orderStatusStats = statusCounts.entrySet()
                .stream()
                .map(entry -> new OrderStatusStat(
                        entry.getKey(),
                        entry.getValue(),
                        totalOrders == 0 ? 0.0 : BigDecimal.valueOf(entry.getValue() * 100.0 / totalOrders)
                                .setScale(1, RoundingMode.HALF_UP)
                                .doubleValue()
                ))
                .toList();

        return new DashboardStatisticsResponse(
                productRepository.countByStatusIgnoreCase("ACTIVE"),
                orderRepository.countNotDeletedByOrderDateBetween(DELETED_STATUS, startOfDay, endOfDay),
                todayRevenue,
                customerRepository.countNotDeletedByCreatedAtBetween(DELETED_STATUS, startOfDay, endOfDay),
                productRepository.countByStatusIgnoreCaseAndStockQuantityLessThanEqual("ACTIVE", LOW_STOCK_LIMIT),
                recentOrders,
                productService.getFeaturedProducts(),
                orderStatusStats
        );
    }
}
