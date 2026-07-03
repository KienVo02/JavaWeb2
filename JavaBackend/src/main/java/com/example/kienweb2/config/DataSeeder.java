package com.example.kienweb2.config;

import com.example.kienweb2.entity.Category;
import com.example.kienweb2.entity.Customer;
import com.example.kienweb2.entity.Order;
import com.example.kienweb2.entity.OrderDetail;
import com.example.kienweb2.entity.Post;
import com.example.kienweb2.entity.Product;
import com.example.kienweb2.entity.ProductSize;
import com.example.kienweb2.entity.User;
import com.example.kienweb2.repository.CategoryRepository;
import com.example.kienweb2.repository.CustomerRepository;
import com.example.kienweb2.repository.OrderRepository;
import com.example.kienweb2.repository.PostRepository;
import com.example.kienweb2.repository.ProductRepository;
import com.example.kienweb2.repository.ProductSizeRepository;
import com.example.kienweb2.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedGoalStoreData(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductSizeRepository productSizeRepository,
            CustomerRepository customerRepository,
            PostRepository postRepository,
            OrderRepository orderRepository,
            UserRepository userRepository
    ) {
        return args -> {
            Category club = upsertCategory(categoryRepository, "CLB nổi bật", "clb-noi-bat",
                    "/image/ChatGPT Image 19_51_19 19 thg 6, 2026 (1).png",
                    "Các câu lạc bộ bóng đá nổi bật.");
            upsertCategory(categoryRepository, "Đội tuyển quốc gia", "doi-tuyen-quoc-gia",
                    "/image/ChatGPT Image 19_51_20 19 thg 6, 2026 (2).png",
                    "Áo đấu đội tuyển quốc gia.");
            upsertCategory(categoryRepository, "Áo sân nhà", "ao-san-nha",
                    "/image/ChatGPT Image 19_51_21 19 thg 6, 2026 (3).png",
                    "Mẫu áo sân nhà mùa giải mới.");
            upsertCategory(categoryRepository, "Áo sân khách", "ao-san-khach",
                    "/image/ChatGPT Image 19_52_57 19 thg 6, 2026.png",
                    "Mẫu áo sân khách được yêu thích.");
            upsertCategory(categoryRepository, "Phụ kiện", "phu-kien",
                    "/image/ChatGPT Image 19_51_21 19 thg 6, 2026 (4).png",
                    "Phụ kiện bóng đá.");
            upsertCategory(categoryRepository, "Áo thủ môn", "ao-thu-mon",
                    "/image/ChatGPT Image 19_51_21 19 thg 6, 2026 (5).png",
                    "Áo thủ môn chính hãng.");

            BigDecimal price = BigDecimal.valueOf(899000);
            List<Product> products = List.of(
                    upsertProduct(productRepository, "Áo Inter Miami CF 24/25", "ao-inter-miami-cf-24-25",
                            price, "/image/ChatGPT Image 19_55_07 19 thg 6, 2026 (5).png",
                            "Inter Miami CF", "MLS", "24/25", 15, club),
                    upsertProduct(productRepository, "Áo Liverpool 24/25", "ao-liverpool-24-25",
                            price, "/image/ChatGPT Image 19_55_07 19 thg 6, 2026 (6).png",
                            "Liverpool", "Premier League", "24/25", 74, club),
                    upsertProduct(productRepository, "Áo Real Madrid 24/25", "ao-real-madrid-24-25",
                            price, "/image/ChatGPT Image 19_55_07 19 thg 6, 2026 (3).png",
                            "Real Madrid", "La Liga", "24/25", 95, club),
                    upsertProduct(productRepository, "Áo Barcelona 24/25", "ao-barcelona-24-25",
                            price, "/image/ChatGPT Image 19_55_07 19 thg 6, 2026 (4).png",
                            "Barcelona", "La Liga", "24/25", 88, club),
                    upsertProduct(productRepository, "Áo Man City 24/25", "ao-man-city-24-25",
                            price, "/image/ChatGPT Image 19_55_09 19 thg 6, 2026 (9).png",
                            "Manchester City", "Premier League", "24/25", 8, club),
                    upsertProduct(productRepository, "Áo Bayern Munich 24/25", "ao-bayern-munich-24-25",
                            price, "/image/ChatGPT Image 19_55_10 19 thg 6, 2026 (10).png",
                            "Bayern Munich", "Bundesliga", "24/25", 10, club),
                    upsertProduct(productRepository, "Áo Arsenal 24/25", "ao-arsenal-24-25",
                            price, "/image/ChatGPT Image 19_55_08 19 thg 6, 2026 (8).png",
                            "Arsenal", "Premier League", "24/25", 12, club),
                    upsertProduct(productRepository, "Áo Manchester United 24/25", "ao-manchester-united-24-25",
                            price, "/image/ChatGPT Image 19_55_06 19 thg 6, 2026 (2).png",
                            "Manchester United", "Premier League", "24/25", 120, club)
            );

            seedSizes(productSizeRepository, products);
            seedCustomers(customerRepository);
            seedPosts(postRepository);
            seedOrders(orderRepository, products);
            seedUsers(userRepository);
        };
    }

    private Category upsertCategory(
            CategoryRepository repository,
            String name,
            String slug,
            String imageUrl,
            String description
    ) {
        Category category = repository.findBySlug(slug).orElseGet(Category::new);
        category.setName(name);
        category.setSlug(slug);
        category.setImageUrl(imageUrl);
        category.setDescription(description);
        category.setStatus("ACTIVE");
        return repository.save(category);
    }

    private Product upsertProduct(
            ProductRepository repository,
            String name,
            String slug,
            BigDecimal price,
            String imageUrl,
            String teamName,
            String leagueName,
            String season,
            Integer stockQuantity,
            Category category
    ) {
        Product product = repository.findBySlug(slug).orElseGet(Product::new);
        product.setName(name);
        product.setSlug(slug);
        product.setPrice(price);
        product.setSalePrice(price);
        product.setImageUrl(imageUrl);
        product.setDescription("Áo đấu chính hãng " + name + ", chất liệu thoáng mát và form thể thao.");
        product.setTeamName(teamName);
        product.setLeagueName(leagueName);
        product.setSeason(season);
        product.setStockQuantity(stockQuantity);
        product.setStatus("ACTIVE");
        product.setCategory(category);
        return repository.save(product);
    }

    private void seedSizes(ProductSizeRepository repository, List<Product> products) {
        for (Product product : products) {
            if (repository.countByProductId(product.getId()) > 0) {
                continue;
            }
            int base = Math.max(1, product.getStockQuantity() / 5);
            repository.saveAll(List.of(
                    createSize(product, "S", base),
                    createSize(product, "M", base + 2),
                    createSize(product, "L", base + 3),
                    createSize(product, "XL", base),
                    createSize(product, "XXL", Math.max(1, base - 1))
            ));
        }
    }

    private ProductSize createSize(Product product, String sizeName, Integer stockQuantity) {
        ProductSize size = new ProductSize();
        size.setProduct(product);
        size.setSizeName(sizeName);
        size.setStockQuantity(stockQuantity);
        return size;
    }

    private void seedCustomers(CustomerRepository repository) {
        if (repository.count() > 0) {
            return;
        }
        repository.saveAll(List.of(
                createCustomer("Nguyễn Văn An", "an.nguyen@example.com", "0901234567", "12 Nguyễn Trãi, Quận 1, TP.HCM"),
                createCustomer("Trần Minh Quân", "quan.tran@example.com", "0912345678", "45 Lê Lợi, Hà Nội"),
                createCustomer("Lê Hoàng Nam", "nam.le@example.com", "0923456789", "78 Hải Phòng, Đà Nẵng"),
                createCustomer("Phạm Tuấn Anh", "anh.pham@example.com", "0934567890", "23 Cầu Giấy, Hà Nội"),
                createCustomer("Đỗ Quốc Huy", "huy.do@example.com", "0945678901", "56 Võ Văn Tần, TP.HCM")
        ));
    }

    private Customer createCustomer(String fullName, String email, String phone, String address) {
        Customer customer = new Customer();
        customer.setFullName(fullName);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setAddress(address);
        return customer;
    }

    private void seedPosts(PostRepository repository) {
        upsertPost(repository, "Cách chọn size áo đá bóng chuẩn cho từng vóc dáng", "cach-chon-size-ao-da-bong",
                "/image/ChatGPT Image 19_57_34 19 thg 6, 2026 (1).png");
        upsertPost(repository, "Top 10 áo đấu đẹp nhất mùa giải 2024/25", "top-10-ao-dau-dep-nhat-2024-25",
                "/image/ChatGPT Image 19_57_34 19 thg 6, 2026 (2).png");
        upsertPost(repository, "Cập nhật áo đấu mới nhất các CLB hàng tuần", "cap-nhat-ao-dau-moi-nhat",
                "/image/ChatGPT Image 19_57_38 19 thg 6, 2026 (8).png");
        upsertPost(repository, "Cách bảo quản áo đấu bền đẹp như mới", "cach-bao-quan-ao-dau",
                "/image/ChatGPT Image 19_57_39 19 thg 6, 2026 (10).png");
    }

    private Post upsertPost(PostRepository repository, String title, String slug, String imageUrl) {
        Post post = repository.findBySlug(slug).orElseGet(Post::new);
        post.setTitle(title);
        post.setSlug(slug);
        post.setImageUrl(imageUrl);
        post.setContent("Bài viết GoalStore chia sẻ kinh nghiệm chọn, mặc và bảo quản áo đấu bóng đá chính hãng.");
        post.setStatus("ACTIVE");
        return repository.save(post);
    }

    private void seedOrders(OrderRepository repository, List<Product> products) {
        if (repository.count() > 0 || products.size() < 5) {
            return;
        }
        repository.saveAll(List.of(
                createOrder("GS2405181", "Nguyễn Văn An", "0901234567", "Hoàn thành",
                        LocalDateTime.now().minusMinutes(2), products.get(0), 2),
                createOrder("GS2405180", "Trần Minh Quân", "0912345678", "Đang xử lý",
                        LocalDateTime.now().minusMinutes(35), products.get(1), 1),
                createOrder("GS2405179", "Lê Hoàng Nam", "0923456789", "Đang giao",
                        LocalDateTime.now().minusHours(1), products.get(2), 3),
                createOrder("GS2405178", "Phạm Tuấn Anh", "0934567890", "Đang xử lý",
                        LocalDateTime.now().minusHours(2), products.get(3), 1),
                createOrder("GS2405177", "Đỗ Quốc Huy", "0945678901", "Hoàn thành",
                        LocalDateTime.now().minusHours(3), products.get(4), 2)
        ));
    }

    private Order createOrder(
            String orderCode,
            String customerName,
            String phone,
            String status,
            LocalDateTime orderDate,
            Product product,
            Integer quantity
    ) {
        BigDecimal unitPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setCustomerName(customerName);
        order.setCustomerEmail(customerName.toLowerCase()
                .replace(" ", ".")
                .replace("đ", "d")
                .replace("ê", "e")
                .replace("ầ", "a") + "@example.com");
        order.setCustomerPhone(phone);
        order.setShippingAddress("Quận 1, TP.HCM");
        order.setPaymentMethod("Thanh toán khi nhận hàng");
        order.setStatus(status);
        order.setOrderDate(orderDate);
        order.setTotalAmount(totalPrice);

        OrderDetail detail = new OrderDetail();
        detail.setProduct(product);
        detail.setSizeName("L");
        detail.setQuantity(quantity);
        detail.setUnitPrice(unitPrice);
        detail.setTotalPrice(totalPrice);
        order.addOrderDetail(detail);
        return order;
    }

    private void seedUsers(UserRepository repository) {
        upsertUser(repository, "Admin GoalStore", "admin@goalstore.vn", "admin123", "ADMIN");
        upsertUser(repository, "Editor GoalStore", "editor@goalstore.vn", "editor123", "EDITOR");
        upsertUser(repository, "User GoalStore", "user@goalstore.vn", "user123", "USER");
    }

    private void upsertUser(UserRepository repository, String fullName, String email, String password, String role) {
        User user = repository.findByEmail(email).orElseGet(User::new);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        user.setStatus("ACTIVE");
        repository.save(user);
    }
}
