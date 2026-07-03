package com.example.kienweb2.repository;

import com.example.kienweb2.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    List<Product> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    List<Product> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status, Pageable pageable);

    List<Product> findByStatusIgnoreCaseAndIdNotOrderByCreatedAtDesc(String status, Long id, Pageable pageable);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByCategoryIdAndStatusIgnoreCase(Long categoryId, String status);

    List<Product> findTop8ByStatusIgnoreCaseOrderByStockQuantityDescCreatedAtDesc(String status);

    List<Product> findTop8ByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    List<Product> findTop8ByStockQuantityLessThanEqualOrderByStockQuantityAsc(Integer stockQuantity);

    List<Product> findTop8ByStatusIgnoreCaseAndStockQuantityLessThanEqualOrderByStockQuantityAsc(String status, Integer stockQuantity);

    long countByStockQuantityLessThanEqual(Integer stockQuantity);

    long countByStatusIgnoreCase(String status);

    long countByStatusIgnoreCaseAndStockQuantityLessThanEqual(String status, Integer stockQuantity);

    @Query("""
            SELECT p FROM Product p
            LEFT JOIN p.category c
            WHERE LOWER(p.status) = LOWER(:status)
              AND (
                   LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.teamName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.leagueName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY p.createdAt DESC
            """)
    List<Product> searchByKeyword(@Param("keyword") String keyword, @Param("status") String status);

    @Query("""
            SELECT p FROM Product p
            LEFT JOIN p.category c
            WHERE p.id <> :productId
              AND LOWER(p.status) = LOWER(:status)
              AND (
                   (:categoryId IS NOT NULL AND c.id = :categoryId)
                OR (:teamName <> '' AND LOWER(COALESCE(p.teamName, '')) = LOWER(:teamName))
                OR (:leagueName <> '' AND LOWER(COALESCE(p.leagueName, '')) = LOWER(:leagueName))
              )
            ORDER BY
              CASE WHEN :categoryId IS NOT NULL AND c.id = :categoryId THEN 0 ELSE 1 END,
              p.createdAt DESC
            """)
    List<Product> findRelatedProducts(
            @Param("productId") Long productId,
            @Param("categoryId") Long categoryId,
            @Param("teamName") String teamName,
            @Param("leagueName") String leagueName,
            @Param("status") String status,
            Pageable pageable
    );
}
