package com.example.kienweb2.service;

import com.example.kienweb2.dto.ProductRequest;
import com.example.kienweb2.dto.ProductResponse;
import java.util.List;

public interface ProductService {

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> searchProducts(String keyword);

    List<ProductResponse> getFeaturedProducts();

    List<ProductResponse> getNewProducts(int limit);

    List<ProductResponse> getRelatedProducts(Long id, int limit);

    List<ProductResponse> getLowStockProducts();

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}
