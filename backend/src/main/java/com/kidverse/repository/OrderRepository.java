package com.kidverse.repository;

import com.kidverse.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    @Query("SELECT DISTINCT oi.product.id FROM OrderItem oi WHERE oi.order.user.id = :userId")
    List<Long> findPurchasedProductIdsByUserId(@Param("userId") Long userId);
}
