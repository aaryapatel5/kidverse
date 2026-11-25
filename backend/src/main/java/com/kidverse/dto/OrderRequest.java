package com.kidverse.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class OrderRequest {

    private Long userId;
    private String username;

    @NotEmpty(message = "Order must contain at least one product")
    private List<Long> productIds;

    private Integer discountPct = 0;
    private Double shipping = 0.0;
    private String freeGift;

    public OrderRequest() {}

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<Long> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Long> productIds) {
        this.productIds = productIds;
    }

    public Integer getDiscountPct() {
        return discountPct;
    }

    public void setDiscountPct(Integer discountPct) {
        this.discountPct = discountPct;
    }

    public Double getShipping() {
        return shipping;
    }

    public void setShipping(Double shipping) {
        this.shipping = shipping;
    }

    public String getFreeGift() {
        return freeGift;
    }

    public void setFreeGift(String freeGift) {
        this.freeGift = freeGift;
    }
}
