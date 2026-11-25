package com.kidverse.controller;

import com.kidverse.entity.Product;
import com.kidverse.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false, defaultValue = "false") boolean budgetOnly) {
        if (budgetOnly) {
            return ResponseEntity.ok(productService.getBudgetProducts());
        }
        if (ageGroup != null && !ageGroup.isBlank() && !"all".equalsIgnoreCase(ageGroup)) {
            return ResponseEntity.ok(productService.getProductsByAgeGroup(ageGroup));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
