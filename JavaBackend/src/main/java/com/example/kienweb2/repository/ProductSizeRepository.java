package com.example.kienweb2.repository;

import com.example.kienweb2.entity.ProductSize;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {

    List<ProductSize> findByProductIdOrderByIdAsc(Long productId);

    Optional<ProductSize> findByProductIdAndSizeNameIgnoreCase(Long productId, String sizeName);

    long countByProductId(Long productId);

    void deleteByProductId(Long productId);
}
