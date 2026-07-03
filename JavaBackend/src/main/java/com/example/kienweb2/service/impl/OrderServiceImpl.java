package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.OrderDetailResponse;
import com.example.kienweb2.dto.OrderItemRequest;
import com.example.kienweb2.dto.OrderRequest;
import com.example.kienweb2.dto.OrderResponse;
import com.example.kienweb2.entity.Customer;
import com.example.kienweb2.entity.Order;
import com.example.kienweb2.entity.OrderDetail;
import com.example.kienweb2.entity.Product;
import com.example.kienweb2.entity.ProductSize;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.CustomerRepository;
import com.example.kienweb2.repository.OrderRepository;
import com.example.kienweb2.repository.ProductRepository;
import com.example.kienweb2.repository.ProductSizeRepository;
import com.example.kienweb2.service.OrderService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CustomerRepository customerRepository;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            ProductSizeRepository productSizeRepository,
            CustomerRepository customerRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.productSizeRepository = productSizeRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findNotDeletedOrderByOrderDateDesc("DELETED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        return toResponse(findOrder(id));
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        validateOrderRequest(request);

        Order order = new Order();
        order.setCustomerName(request.customerName().trim());
        order.setCustomerEmail(trimToNull(request.customerEmail()));
        order.setCustomerPhone(trimToNull(request.customerPhone()));
        order.setShippingAddress(request.shippingAddress().trim());
        order.setPaymentMethod(hasText(request.paymentMethod()) ? request.paymentMethod().trim() : "Thanh toán khi nhận hàng");
        order.setStatus("Đang xử lý");

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest item : request.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id: " + item.productId()));
            if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
                throw new BadRequestException("San pham " + product.getName() + " hien khong the dat hang.");
            }

            int quantity = item.quantity() == null ? 0 : item.quantity();
            if (quantity <= 0) {
                throw new BadRequestException("So luong san pham phai lon hon 0.");
            }
            String sizeName = hasText(item.sizeName()) ? item.sizeName().trim().toUpperCase() : "M";
            validateStock(product, sizeName, quantity);

            BigDecimal unitPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            OrderDetail detail = new OrderDetail();
            detail.setProduct(product);
            detail.setSizeName(sizeName);
            detail.setQuantity(quantity);
            detail.setUnitPrice(unitPrice);
            detail.setTotalPrice(lineTotal);
            order.addOrderDetail(detail);

            product.setStockQuantity(Math.max(0, product.getStockQuantity() - quantity));
            reduceSizeStock(product.getId(), detail.getSizeName(), quantity);
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount);
        createCustomerIfNeeded(request);
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        if (!hasText(status)) {
            throw new BadRequestException("Trang thai don hang khong duoc de trong.");
        }
        Order order = findOrder(id);
        order.setStatus(status.trim());
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = findOrder(id);
        order.setStatus("DELETED");
        orderRepository.save(order);
    }

    private void validateOrderRequest(OrderRequest request) {
        if (!hasText(request.customerName())) {
            throw new BadRequestException("Ten khach hang khong duoc de trong.");
        }
        if (!hasText(request.shippingAddress())) {
            throw new BadRequestException("Dia chi giao hang khong duoc de trong.");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("Don hang can co it nhat mot san pham.");
        }
    }

    private void validateStock(Product product, String sizeName, int quantity) {
        int productStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        if (productStock < quantity) {
            throw new BadRequestException("San pham " + product.getName() + " chi con " + productStock + " san pham.");
        }

        productSizeRepository.findByProductIdAndSizeNameIgnoreCase(product.getId(), sizeName)
                .ifPresent(size -> {
                    int sizeStock = size.getStockQuantity() == null ? 0 : size.getStockQuantity();
                    if (sizeStock < quantity) {
                        throw new BadRequestException("Size " + sizeName + " cua " + product.getName() + " chi con " + sizeStock + " san pham.");
                    }
                });
    }

    private void reduceSizeStock(Long productId, String sizeName, int quantity) {
        productSizeRepository.findByProductIdAndSizeNameIgnoreCase(productId, sizeName)
                .ifPresent(size -> {
                    size.setStockQuantity(Math.max(0, size.getStockQuantity() - quantity));
                    productSizeRepository.save(size);
                });
    }

    private void createCustomerIfNeeded(OrderRequest request) {
        Customer customer = new Customer();
        customer.setFullName(request.customerName().trim());
        customer.setEmail(trimToNull(request.customerEmail()));
        customer.setPhone(trimToNull(request.customerPhone()));
        customer.setAddress(request.shippingAddress().trim());
        customerRepository.save(customer);
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don hang id: " + id));
    }

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getShippingAddress(),
                order.getTotalAmount(),
                order.getPaymentMethod(),
                order.getStatus(),
                order.getOrderDate(),
                order.getOrderDetails().stream().map(this::toDetailResponse).toList()
        );
    }

    private OrderDetailResponse toDetailResponse(OrderDetail detail) {
        Product product = detail.getProduct();
        return new OrderDetailResponse(
                detail.getId(),
                product == null ? null : product.getId(),
                product == null ? "Sản phẩm đã xóa" : product.getName(),
                product == null ? null : product.getImageUrl(),
                detail.getSizeName(),
                detail.getQuantity(),
                detail.getUnitPrice(),
                detail.getTotalPrice()
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }
}
