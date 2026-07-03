package com.example.kienweb2.repository;

import com.example.kienweb2.entity.Customer;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
            SELECT c FROM Customer c
            WHERE c.status IS NULL OR LOWER(c.status) <> LOWER(:status)
            ORDER BY c.createdAt DESC
            """)
    List<Customer> findNotDeletedOrderByCreatedAtDesc(@Param("status") String status);

    List<Customer> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    @Query("""
            SELECT COUNT(c) FROM Customer c
            WHERE (c.status IS NULL OR LOWER(c.status) <> LOWER(:status))
              AND c.createdAt BETWEEN :start AND :end
            """)
    long countNotDeletedByCreatedAtBetween(
            @Param("status") String status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
