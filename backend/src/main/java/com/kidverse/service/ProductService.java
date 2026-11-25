package com.kidverse.service;

import com.kidverse.entity.Product;
import com.kidverse.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByAgeGroup(String ageGroup) {
        if ("all".equalsIgnoreCase(ageGroup) || ageGroup == null || ageGroup.isBlank()) {
            return productRepository.findAll();
        }
        return productRepository.findByAgeGroup(ageGroup);
    }

    public List<Product> getBudgetProducts() {
        return productRepository.findByIsBudgetTrue();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
}
