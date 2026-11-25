package com.kidverse.controller;

import com.kidverse.dto.OrderRequest;
import com.kidverse.dto.OrderResponse;
import com.kidverse.service.OrderService;
import com.kidverse.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final TokenService tokenService;

    public OrderController(OrderService orderService, TokenService tokenService) {
        this.orderService = orderService;
        this.tokenService = tokenService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenService.TokenClaims claims = tokenService.validateAndExtract(authHeader);
        OrderResponse response = orderService.createOrder(request, claims);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @RequestParam String username,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenService.TokenClaims claims = tokenService.validateAndExtract(authHeader);
        return ResponseEntity.ok(orderService.getOrdersByUsername(username, claims));
    }

    @GetMapping("/purchased")
    public ResponseEntity<List<Long>> getPurchasedProductIds(
            @RequestParam String username,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenService.TokenClaims claims = tokenService.validateAndExtract(authHeader);
        return ResponseEntity.ok(orderService.getPurchasedProductIds(username, claims));
    }
}
