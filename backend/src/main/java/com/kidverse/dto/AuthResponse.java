package com.kidverse.dto;

public class AuthResponse {

    private Long id;
    private String username;
    private String email;
    private String role;
    private String message;
    private Integer stars;
    private String token;

    public AuthResponse() {}

    public AuthResponse(Long id, String username, String email, String role, String message, Integer stars) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.message = message;
        this.stars = stars;
    }

    public AuthResponse(Long id, String username, String email, String role, String message, Integer stars, String token) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.message = message;
        this.stars = stars;
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
