package com.kidverse.controller;

import com.kidverse.dto.ProgressResponse;
import com.kidverse.dto.StarUpdateRequest;
import com.kidverse.service.ProgressService;
import com.kidverse.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final TokenService tokenService;

    public ProgressController(ProgressService progressService, TokenService tokenService) {
        this.progressService = progressService;
        this.tokenService = tokenService;
    }

    @GetMapping("/{childUsername}")
    public ResponseEntity<ProgressResponse> getProgress(
            @PathVariable String childUsername,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenService.TokenClaims claims = tokenService.validateAndExtract(authHeader);
        return ResponseEntity.ok(progressService.getProgress(childUsername, claims));
    }

    @GetMapping("/parent/{parentUsername}")
    public ResponseEntity<ProgressResponse> getProgressForParent(
            @PathVariable String parentUsername,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenService.TokenClaims claims = tokenService.validateAndExtract(authHeader);
        return ResponseEntity.ok(progressService.getProgressForParent(parentUsername, claims));
    }

    @PostMapping("/star")
    public ResponseEntity<ProgressResponse> addStar(
            @RequestBody StarUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenService.TokenClaims claims = tokenService.validateAndExtract(authHeader);
        return ResponseEntity.ok(progressService.addStars(request, claims));
    }
}
