package com.example.kienweb2.repository;

import com.example.kienweb2.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    @Query("""
            SELECT c FROM Category c
            WHERE c.status IS NULL OR LOWER(c.status) <> LOWER(:status)
            ORDER BY c.createdAt DESC
            """)
    List<Category> findNotDeletedOrderByCreatedAtDesc(@Param("status") String status);
}
