package com.example.kienweb2.repository;

import com.example.kienweb2.entity.Post;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    List<Post> findTop4ByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    List<Post> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    @Query("""
            SELECT p FROM Post p
            WHERE p.status IS NULL OR LOWER(p.status) <> LOWER(:status)
            ORDER BY p.createdAt DESC
            """)
    List<Post> findNotDeletedOrderByCreatedAtDesc(@Param("status") String status);
}
