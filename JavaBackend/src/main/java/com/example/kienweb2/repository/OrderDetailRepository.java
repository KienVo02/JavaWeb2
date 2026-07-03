package com.example.kienweb2.repository;

import com.example.kienweb2.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    long countByProductId(Long productId);
}
