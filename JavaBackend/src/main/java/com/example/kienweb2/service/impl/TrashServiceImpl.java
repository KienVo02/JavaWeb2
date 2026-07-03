package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.TrashItemResponse;
import com.example.kienweb2.entity.Category;
import com.example.kienweb2.entity.Customer;
import com.example.kienweb2.entity.Order;
import com.example.kienweb2.entity.Post;
import com.example.kienweb2.entity.Product;
import com.example.kienweb2.entity.User;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.CategoryRepository;
import com.example.kienweb2.repository.CustomerRepository;
import com.example.kienweb2.repository.OrderDetailRepository;
import com.example.kienweb2.repository.OrderRepository;
import com.example.kienweb2.repository.PostRepository;
import com.example.kienweb2.repository.ProductRepository;
import com.example.kienweb2.repository.ProductSizeRepository;
import com.example.kienweb2.repository.UserRepository;
import com.example.kienweb2.service.TrashService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrashServiceImpl implements TrashService {

    private static final String DELETED_STATUS = "DELETED";
    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final String RESTORED_ORDER_STATUS = "Đang xử lý";

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductSizeRepository productSizeRepository;
    private final OrderDetailRepository orderDetailRepository;

    public TrashServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            PostRepository postRepository,
            CustomerRepository customerRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductSizeRepository productSizeRepository,
            OrderDetailRepository orderDetailRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.postRepository = postRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productSizeRepository = productSizeRepository;
        this.orderDetailRepository = orderDetailRepository;
    }

    @Override
    public List<TrashItemResponse> getTrashItems() {
        List<TrashItemResponse> items = new ArrayList<>();

        productRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(DELETED_STATUS)
                .forEach(product -> items.add(new TrashItemResponse(
                        "products",
                        "Sản phẩm",
                        product.getId(),
                        product.getName(),
                        joinDetail(product.getTeamName(), product.getLeagueName()),
                        product.getStatus(),
                        product.getCreatedAt()
                )));

        categoryRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(DELETED_STATUS)
                .forEach(category -> items.add(new TrashItemResponse(
                        "categories",
                        "Danh mục",
                        category.getId(),
                        category.getName(),
                        category.getSlug(),
                        category.getStatus(),
                        category.getCreatedAt()
                )));

        postRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(DELETED_STATUS)
                .forEach(post -> items.add(new TrashItemResponse(
                        "posts",
                        "Tin tức",
                        post.getId(),
                        post.getTitle(),
                        post.getSlug(),
                        post.getStatus(),
                        post.getCreatedAt()
                )));

        customerRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(DELETED_STATUS)
                .forEach(customer -> items.add(new TrashItemResponse(
                        "customers",
                        "Khách hàng",
                        customer.getId(),
                        customer.getFullName(),
                        joinDetail(customer.getPhone(), customer.getEmail()),
                        customer.getStatus(),
                        customer.getCreatedAt()
                )));

        orderRepository.findByStatusIgnoreCaseOrderByOrderDateDesc(DELETED_STATUS)
                .forEach(order -> items.add(new TrashItemResponse(
                        "orders",
                        "Đơn hàng",
                        order.getId(),
                        "#" + order.getOrderCode(),
                        joinDetail(order.getCustomerName(), order.getCustomerPhone()),
                        order.getStatus(),
                        order.getOrderDate()
                )));

        userRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(DELETED_STATUS)
                .forEach(user -> items.add(new TrashItemResponse(
                        "users",
                        "Tài khoản",
                        user.getId(),
                        user.getFullName(),
                        joinDetail(user.getRole(), user.getEmail()),
                        user.getStatus(),
                        user.getCreatedAt()
                )));

        return items.stream()
                .sorted(Comparator.comparing(TrashItemResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Override
    @Transactional
    public void restore(String type, Long id) {
        switch (normalizeType(type)) {
            case "products" -> restoreProduct(id);
            case "categories" -> restoreCategory(id);
            case "posts" -> restorePost(id);
            case "customers" -> restoreCustomer(id);
            case "orders" -> restoreOrder(id);
            case "users" -> restoreUser(id);
            default -> throw new BadRequestException("Loai du lieu thung rac khong hop le.");
        }
    }

    @Override
    @Transactional
    public void deletePermanently(String type, Long id) {
        switch (normalizeType(type)) {
            case "products" -> deleteProductPermanently(id);
            case "categories" -> deleteCategoryPermanently(id);
            case "posts" -> deletePostPermanently(id);
            case "customers" -> deleteCustomerPermanently(id);
            case "orders" -> deleteOrderPermanently(id);
            case "users" -> deleteUserPermanently(id);
            default -> throw new BadRequestException("Loai du lieu thung rac khong hop le.");
        }
    }

    private void restoreProduct(Long id) {
        Product product = findProduct(id);
        ensureInTrash(product.getStatus());
        product.setStatus(ACTIVE_STATUS);
        productRepository.save(product);
    }

    private void restoreCategory(Long id) {
        Category category = findCategory(id);
        ensureInTrash(category.getStatus());
        category.setStatus(ACTIVE_STATUS);
        categoryRepository.save(category);
    }

    private void restorePost(Long id) {
        Post post = findPost(id);
        ensureInTrash(post.getStatus());
        post.setStatus(ACTIVE_STATUS);
        postRepository.save(post);
    }

    private void restoreCustomer(Long id) {
        Customer customer = findCustomer(id);
        ensureInTrash(customer.getStatus());
        customer.setStatus(ACTIVE_STATUS);
        customerRepository.save(customer);
    }

    private void restoreOrder(Long id) {
        Order order = findOrder(id);
        ensureInTrash(order.getStatus());
        order.setStatus(RESTORED_ORDER_STATUS);
        orderRepository.save(order);
    }

    private void restoreUser(Long id) {
        User user = findUser(id);
        ensureInTrash(user.getStatus());
        user.setStatus(ACTIVE_STATUS);
        userRepository.save(user);
    }

    private void deleteProductPermanently(Long id) {
        Product product = findProduct(id);
        ensureInTrash(product.getStatus());
        if (orderDetailRepository.countByProductId(id) > 0) {
            throw new BadRequestException("San pham da co lich su don hang, khong the xoa vinh vien.");
        }
        productSizeRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private void deleteCategoryPermanently(Long id) {
        Category category = findCategory(id);
        ensureInTrash(category.getStatus());
        List<Product> products = productRepository.findByCategoryId(id);
        products.forEach(product -> product.setCategory(null));
        productRepository.saveAll(products);
        categoryRepository.delete(category);
    }

    private void deletePostPermanently(Long id) {
        Post post = findPost(id);
        ensureInTrash(post.getStatus());
        postRepository.delete(post);
    }

    private void deleteCustomerPermanently(Long id) {
        Customer customer = findCustomer(id);
        ensureInTrash(customer.getStatus());
        customerRepository.delete(customer);
    }

    private void deleteOrderPermanently(Long id) {
        Order order = findOrder(id);
        ensureInTrash(order.getStatus());
        orderRepository.delete(order);
    }

    private void deleteUserPermanently(Long id) {
        User user = findUser(id);
        ensureInTrash(user.getStatus());
        userRepository.delete(user);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id: " + id));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc id: " + id));
    }

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bai viet id: " + id));
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang id: " + id));
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don hang id: " + id));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay tai khoan id: " + id));
    }

    private String normalizeType(String type) {
        return type == null ? "" : type.trim().toLowerCase();
    }

    private void ensureInTrash(String status) {
        if (!DELETED_STATUS.equalsIgnoreCase(status)) {
            throw new BadRequestException("Muc nay khong nam trong thung rac.");
        }
    }

    private String joinDetail(String first, String second) {
        if (hasText(first) && hasText(second)) {
            return first.trim() + " - " + second.trim();
        }
        if (hasText(first)) {
            return first.trim();
        }
        if (hasText(second)) {
            return second.trim();
        }
        return "";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
