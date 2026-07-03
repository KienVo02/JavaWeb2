package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.ProductRequest;
import com.example.kienweb2.dto.ProductResponse;
import com.example.kienweb2.dto.ProductSizeRequest;
import com.example.kienweb2.dto.ProductSizeResponse;
import com.example.kienweb2.entity.Category;
import com.example.kienweb2.entity.Product;
import com.example.kienweb2.entity.ProductSize;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.CategoryRepository;
import com.example.kienweb2.repository.OrderDetailRepository;
import com.example.kienweb2.repository.ProductRepository;
import com.example.kienweb2.repository.ProductSizeRepository;
import com.example.kienweb2.service.ProductService;
import com.example.kienweb2.service.SlugService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {

    private static final int LOW_STOCK_LIMIT = 20;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductSizeRepository productSizeRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final SlugService slugService;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductSizeRepository productSizeRepository,
            OrderDetailRepository orderDetailRepository,
            SlugService slugService
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productSizeRepository = productSizeRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.slugService = slugService;
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("ACTIVE")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return toResponse(findActiveProduct(id));
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        ensureCategoryExists(categoryId);
        return productRepository.findByCategoryIdAndStatusIgnoreCase(categoryId, "ACTIVE")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> searchProducts(String keyword) {
        if (!hasText(keyword)) {
            return getAllProducts();
        }

        return productRepository.searchByKeyword(keyword.trim(), "ACTIVE")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findTop8ByStatusIgnoreCaseOrderByStockQuantityDescCreatedAtDesc("ACTIVE")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getNewProducts(int limit) {
        return productRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("ACTIVE", PageRequest.of(0, normalizeLimit(limit, 6, 24)))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getRelatedProducts(Long id, int limit) {
        Product product = findActiveProduct(id);
        int safeLimit = normalizeLimit(limit, 4, 12);
        Long categoryId = product.getCategory() == null ? null : product.getCategory().getId();
        String teamName = hasText(product.getTeamName()) ? product.getTeamName().trim() : "";
        String leagueName = hasText(product.getLeagueName()) ? product.getLeagueName().trim() : "";

        List<Product> relatedProducts = new ArrayList<>(productRepository.findRelatedProducts(
                product.getId(),
                categoryId,
                teamName,
                leagueName,
                "ACTIVE",
                PageRequest.of(0, safeLimit)
        ));

        if (relatedProducts.size() < safeLimit) {
            Set<Long> usedIds = new HashSet<>();
            usedIds.add(product.getId());
            relatedProducts.forEach(item -> usedIds.add(item.getId()));

            productRepository.findByStatusIgnoreCaseAndIdNotOrderByCreatedAtDesc(
                            "ACTIVE",
                            product.getId(),
                            PageRequest.of(0, safeLimit * 2)
                    )
                    .stream()
                    .filter(item -> !usedIds.contains(item.getId()))
                    .limit(safeLimit - relatedProducts.size())
                    .forEach(relatedProducts::add);
        }

        return relatedProducts.stream()
                .limit(safeLimit)
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findTop8ByStatusIgnoreCaseAndStockQuantityLessThanEqualOrderByStockQuantityAsc("ACTIVE", LOW_STOCK_LIMIT)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (!hasText(request.getName())) {
            throw new BadRequestException("Ten san pham khong duoc de trong.");
        }

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setSlug(buildUniqueSlug(resolveSlug(request.getSlug(), request.getName()), null));
        applyProductData(product, request, true);

        Product savedProduct = productRepository.save(product);
        replaceProductSizes(savedProduct, request.getSizes());
        return toResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);

        boolean nameChanged = false;
        if (hasText(request.getName())) {
            String nextName = request.getName().trim();
            nameChanged = !nextName.equals(product.getName());
            product.setName(nextName);
        }

        if (hasText(request.getSlug())) {
            product.setSlug(buildUniqueSlug(slugService.slugify(request.getSlug()), id));
        } else if (nameChanged) {
            product.setSlug(buildUniqueSlug(slugService.slugify(product.getName()), id));
        }

        applyProductData(product, request, false);

        Product savedProduct = productRepository.save(product);
        if (request.getSizes() != null) {
            replaceProductSizes(savedProduct, request.getSizes());
        }

        return toResponse(savedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        product.setStatus("DELETED");
        productRepository.save(product);
    }

    private void applyProductData(Product product, ProductRequest request, boolean creating) {
        if (creating || request.getPrice() != null) {
            product.setPrice(request.getPrice() == null ? BigDecimal.ZERO : request.getPrice());
        }
        if (creating || request.getSalePrice() != null) {
            product.setSalePrice(request.getSalePrice());
        }
        if (creating || request.getImageUrl() != null) {
            product.setImageUrl(trimToNull(request.getImageUrl()));
        }
        if (creating || request.getDescription() != null) {
            product.setDescription(trimToNull(request.getDescription()));
        }
        if (creating || request.getTeamName() != null) {
            product.setTeamName(trimToNull(request.getTeamName()));
        }
        if (creating || request.getLeagueName() != null) {
            product.setLeagueName(trimToNull(request.getLeagueName()));
        }
        if (creating || request.getSeason() != null) {
            product.setSeason(trimToNull(request.getSeason()));
        }
        if (creating || request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity() == null ? 0 : request.getStockQuantity());
        }
        if (creating || request.getStatus() != null) {
            product.setStatus(hasText(request.getStatus()) ? request.getStatus().trim() : "ACTIVE");
        }
        if (request.getCategoryId() != null) {
            product.setCategory(ensureCategoryExists(request.getCategoryId()));
        }
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id: " + id));
    }

    private Product findActiveProduct(Long id) {
        Product product = findProduct(id);
        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new ResourceNotFoundException("Khong tim thay san pham id: " + id);
        }
        return product;
    }

    private void replaceProductSizes(Product product, List<ProductSizeRequest> sizes) {
        if (sizes == null) {
            return;
        }

        productSizeRepository.deleteByProductId(product.getId());
        List<ProductSize> nextSizes = sizes.stream()
                .filter(size -> hasText(size.sizeName()))
                .map(size -> {
                    ProductSize productSize = new ProductSize();
                    productSize.setProduct(product);
                    productSize.setSizeName(size.sizeName().trim().toUpperCase());
                    productSize.setStockQuantity(size.stockQuantity() == null ? 0 : size.stockQuantity());
                    return productSize;
                })
                .toList();
        productSizeRepository.saveAll(nextSizes);
    }

    private Category ensureCategoryExists(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc id: " + categoryId));
    }

    private String buildUniqueSlug(String baseSlug, Long currentId) {
        String slug = baseSlug;
        int index = 2;

        while (productRepository.findBySlug(slug)
                .filter(product -> currentId == null || !product.getId().equals(currentId))
                .isPresent()) {
            slug = baseSlug + "-" + index;
            index++;
        }

        return slug;
    }

    private String resolveSlug(String slug, String name) {
        return hasText(slug) ? slugService.slugify(slug) : slugService.slugify(name);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private int normalizeLimit(int limit, int defaultLimit, int maxLimit) {
        if (limit <= 0) {
            return defaultLimit;
        }
        return Math.min(limit, maxLimit);
    }

    private String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setPrice(product.getPrice());
        response.setSalePrice(product.getSalePrice());
        response.setImageUrl(product.getImageUrl());
        response.setDescription(product.getDescription());
        response.setTeamName(product.getTeamName());
        response.setLeagueName(product.getLeagueName());
        response.setSeason(product.getSeason());
        response.setStockQuantity(product.getStockQuantity());
        response.setStatus(product.getStatus());
        response.setCreatedAt(product.getCreatedAt());

        Category category = product.getCategory();
        if (category != null) {
            response.setCategoryId(category.getId());
            response.setCategoryName(category.getName());
        }
        response.setSizes(productSizeRepository.findByProductIdOrderByIdAsc(product.getId())
                .stream()
                .map(size -> new ProductSizeResponse(
                        size.getId(),
                        size.getSizeName(),
                        size.getStockQuantity()
                ))
                .toList());

        return response;
    }
}
