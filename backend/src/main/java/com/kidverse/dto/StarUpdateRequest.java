package com.kidverse.dto;

public class StarUpdateRequest {

    private String username;
    private String gameId;
    private Integer starsToAdd = 1;
    private String callerUsername;

    public StarUpdateRequest() {}

    public StarUpdateRequest(String username, String gameId, Integer starsToAdd) {
        this.username = username;
        this.gameId = gameId;
        this.starsToAdd = starsToAdd;
    }

    public StarUpdateRequest(String username, String gameId, Integer starsToAdd, String callerUsername) {
        this.username = username;
        this.gameId = gameId;
        this.starsToAdd = starsToAdd;
        this.callerUsername = callerUsername;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public Integer getStarsToAdd() {
        return starsToAdd;
    }

    public void setStarsToAdd(Integer starsToAdd) {
        this.starsToAdd = starsToAdd;
    }

    public String getCallerUsername() {
        return callerUsername;
    }

    public void setCallerUsername(String callerUsername) {
        this.callerUsername = callerUsername;
    }
}
