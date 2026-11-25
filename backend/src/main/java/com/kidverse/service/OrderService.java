package com.kidverse.service;

import com.kidverse.dto.OrderRequest;
import com.kidverse.dto.OrderResponse;
import com.kidverse.entity.Order;
import com.kidverse.entity.OrderItem;
import com.kidverse.entity.Product;
import com.kidverse.entity.User;
import com.kidverse.exception.BadCredentialsException;
import com.kidverse.repository.OrderRepository;
import com.kidverse.repository.ProductRepository;
import com.kidverse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, TokenService.TokenClaims claims) {
        String rawUsername = request.getUsername();
        if (rawUsername == null || rawUsername.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required to place an order.");
        }
        final String username = rawUsername.trim();

        // 1. Genuine Token Verification: Require PARENT role
        if (!"PARENT".equalsIgnoreCase(claims.getRole())) {
            throw new BadCredentialsException("Access denied: Authenticated user '" + claims.getUsername()
                    + "' has role " + claims.getRole() + ". Only registered PARENT accounts are permitted to place orders.");
        }

        // 2. Identity Check: Token subject must match order owner (prevent impersonation)
        if (!claims.getUsername().equalsIgnoreCase(username)) {
            throw new BadCredentialsException("Access denied: Authenticated user '" + claims.getUsername()
                    + "' cannot place orders for user '" + username + "'.");
        }

        // 3. Fetch user from MySQL database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User '" + username + "' is not registered."));

        // 4. Validate products
        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one product ID.");
        }

        List<Product> products = productRepository.findAllById(request.getProductIds());
        if (products.isEmpty()) {
            throw new IllegalArgumentException("No valid products found for order.");
        }

        double subtotal = products.stream().mapToDouble(Product::getPrice).sum();
        int discountPct = request.getDiscountPct() > 0 ? request.getDiscountPct() : 0;
        double discountAmount = (subtotal * discountPct) / 100.0;
        double shipping = request.getShipping() > 0 ? request.getShipping() : 0.0;
        double total = Math.max(0.0, subtotal - discountAmount + shipping);

        Order order = new Order();
        order.setUser(user);
        order.setSubtotal(subtotal);
        order.setDiscountPct(discountPct);
        order.setDiscountAmount(discountAmount);
        order.setShipping(shipping);
        order.setTotal(total);
        order.setFreeGift(request.getFreeGift());
        order.setStatus("CONFIRMED");

        List<OrderItem> items = new ArrayList<>();
        for (Product p : products) {
            OrderItem item = new OrderItem(order, p, p.getPrice());
            items.add(item);
        }
        order.setItems(items);

        Order saved = orderRepository.save(order);

        OrderResponse response = new OrderResponse();
        response.setOrderId(saved.getId());
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setSubtotal(saved.getSubtotal());
        response.setDiscountPct(saved.getDiscountPct());
        response.setDiscountAmount(saved.getDiscountAmount());
        response.setShipping(saved.getShipping());
        response.setTotal(saved.getTotal());
        response.setFreeGift(saved.getFreeGift());
        response.setStatus(saved.getStatus());
        response.setOrderDate(saved.getOrderDate());
        response.setProductIds(products.stream().map(Product::getId).toList());

        return response;
    }

    @Transactional(readOnly = true)
    public List<Long> getPurchasedProductIds(String username, TokenService.TokenClaims claims) {
        if (username == null || username.trim().isEmpty()) {
            return List.of();
        }
        final String cleanUsername = username.trim();

        // 1. Role verification
        if (!"PARENT".equalsIgnoreCase(claims.getRole())) {
            throw new BadCredentialsException("Access denied: Authenticated user has role " + claims.getRole()
                    + ". Only registered PARENT accounts can view purchased items.");
        }

        // 2. Identity verification: Prevent cross-user snooping
        if (!claims.getUsername().equalsIgnoreCase(cleanUsername)) {
            throw new BadCredentialsException("Access denied: You are not authorized to view purchased products for '" + cleanUsername + "'.");
        }

        return userRepository.findByUsername(cleanUsername)
                .map(user -> orderRepository.findPurchasedProductIdsByUserId(user.getId()))
                .orElse(List.of());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUsername(String username, TokenService.TokenClaims claims) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username parameter is required.");
        }
        final String cleanUsername = username.trim();

        // 1. Role check
        if (!"PARENT".equalsIgnoreCase(claims.getRole())) {
            throw new BadCredentialsException("Access denied: Authenticated user has role " + claims.getRole()
                    + ". CHILD accounts do not have order history.");
        }

        // 2. Identity verification
        if (!claims.getUsername().equalsIgnoreCase(cleanUsername)) {
            throw new BadCredentialsException("Access denied: You are not authorized to view orders belonging to '" + cleanUsername + "'.");
        }

        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new IllegalArgumentException("User '" + cleanUsername + "' is not registered."));

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
        List<OrderResponse> responses = new ArrayList<>();
        for (Order o : orders) {
            OrderResponse r = new OrderResponse();
            r.setOrderId(o.getId());
            r.setUserId(user.getId());
            r.setUsername(user.getUsername());
            r.setSubtotal(o.getSubtotal());
            r.setDiscountPct(o.getDiscountPct());
            r.setDiscountAmount(o.getDiscountAmount());
            r.setShipping(o.getShipping());
            r.setTotal(o.getTotal());
            r.setFreeGift(o.getFreeGift());
            r.setStatus(o.getStatus());
            r.setOrderDate(o.getOrderDate());

            List<Long> pIds = o.getItems().stream()
                    .map(item -> item.getProduct().getId())
                    .toList();
            r.setProductIds(pIds);
            responses.add(r);
        }
        return responses;
    }
}
