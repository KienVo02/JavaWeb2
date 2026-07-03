package com.example.kienweb2.repository;

import com.example.kienweb2.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByAuthToken(String authToken);

    long countByRoleIgnoreCaseAndStatusIgnoreCase(String role, String status);

    List<User> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    @Query("""
            SELECT u FROM User u
            WHERE LOWER(u.status) <> LOWER(:status)
            ORDER BY u.createdAt DESC
            """)
    List<User> findNotDeletedOrderByCreatedAtDesc(@Param("status") String status);
}
