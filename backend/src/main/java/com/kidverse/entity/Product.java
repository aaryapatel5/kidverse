package com.kidverse.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String age;

    @Column(name = "age_group", nullable = false, length = 20)
    private String ageGroup; // "3-5", "6-8", "9+"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false, length = 50)
    private String color;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "video_url", nullable = false, length = 500)
    private String videoUrl;

    @Column(name = "is_budget")
    private Boolean isBudget = false;

    public Product() {}

    public Product(Long id, String title, String age, String ageGroup, String description,
                   Double price, String color, String imageUrl, String videoUrl, Boolean isBudget) {
        this.id = id;
        this.title = title;
        this.age = age;
        this.ageGroup = ageGroup;
        this.description = description;
        this.price = price;
        this.color = color;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
        this.isBudget = isBudget;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public Boolean getIsBudget() {
        return isBudget;
    }

    public void setIsBudget(Boolean budget) {
        isBudget = budget;
    }
}
