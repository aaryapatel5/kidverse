package com.kidverse.dto;

public class ProgressResponse {

    private String childUsername;
    private Integer stars;
    private String lastGame;
    private Integer rewardDiscount;
    private String rewardTier;

    public ProgressResponse() {}

    public ProgressResponse(String childUsername, Integer stars, String lastGame, Integer rewardDiscount, String rewardTier) {
        this.childUsername = childUsername;
        this.stars = stars;
        this.lastGame = lastGame;
        this.rewardDiscount = rewardDiscount;
        this.rewardTier = rewardTier;
    }

    public String getChildUsername() {
        return childUsername;
    }

    public void setChildUsername(String childUsername) {
        this.childUsername = childUsername;
    }

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }

    public String getLastGame() {
        return lastGame;
    }

    public void setLastGame(String lastGame) {
        this.lastGame = lastGame;
    }

    public Integer getRewardDiscount() {
        return rewardDiscount;
    }

    public void setRewardDiscount(Integer rewardDiscount) {
        this.rewardDiscount = rewardDiscount;
    }

    public String getRewardTier() {
        return rewardTier;
    }

    public void setRewardTier(String rewardTier) {
        this.rewardTier = rewardTier;
    }
}
