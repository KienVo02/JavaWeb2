package com.example.kienweb2.repository;

import com.example.kienweb2.entity.Order;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findTop5ByOrderByOrderDateDesc();

    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
            SELECT o FROM Order o
            WHERE LOWER(o.status) <> LOWER(:status)
            ORDER BY o.orderDate DESC
            """)
    List<Order> findNotDeletedOrderByOrderDateDesc(@Param("status") String status);

    @Query("""
            SELECT o FROM Order o
            WHERE LOWER(o.status) <> LOWER(:status)
            ORDER BY o.orderDate DESC
            """)
    List<Order> findRecentNotDeleted(@Param("status") String status, Pageable pageable);

    List<Order> findByStatusIgnoreCaseOrderByOrderDateDesc(String status);

    @Query("""
            SELECT COUNT(o) FROM Order o
            WHERE LOWER(o.status) <> LOWER(:status)
              AND o.orderDate BETWEEN :start AND :end
            """)
    long countNotDeletedByOrderDateBetween(
            @Param("status") String status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
