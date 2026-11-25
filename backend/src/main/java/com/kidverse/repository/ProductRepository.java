package com.kidverse.repository;

import com.kidverse.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAgeGroup(String ageGroup);
    List<Product> findByIsBudgetTrue();
}
