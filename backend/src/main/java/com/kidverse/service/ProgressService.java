package com.kidverse.service;

import com.kidverse.dto.ProgressResponse;
import com.kidverse.dto.StarUpdateRequest;
import com.kidverse.entity.ChildProgress;
import com.kidverse.entity.User;
import com.kidverse.exception.BadCredentialsException;
import com.kidverse.repository.ChildProgressRepository;
import com.kidverse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgressService {

    private final ChildProgressRepository childProgressRepository;
    private final UserRepository userRepository;

    public ProgressService(ChildProgressRepository childProgressRepository,
                           UserRepository userRepository) {
        this.childProgressRepository = childProgressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProgressResponse getProgress(String childUsername, TokenService.TokenClaims claims) {
        if (childUsername == null || childUsername.trim().isEmpty()) {
            throw new IllegalArgumentException("Child username is required.");
        }
        final String name = childUsername.trim();

        // 1. Fetch child from MySQL
        User child = userRepository.findByUsername(name)
                .orElseThrow(() -> new IllegalArgumentException("Child account '" + name + "' is not registered."));

        // 2. Role verification
        if (!"CHILD".equalsIgnoreCase(child.getRole())) {
            throw new IllegalArgumentException("User '" + name + "' has role " + child.getRole() + ", not CHILD.");
        }

        // 3. Privacy check: A child cannot view another child's progress
        if ("CHILD".equalsIgnoreCase(claims.getRole()) && !claims.getUsername().equalsIgnoreCase(name)) {
            throw new BadCredentialsException("Access denied: Child '" + claims.getUsername()
                    + "' is not permitted to view progress of child '" + name + "'.");
        }

        ChildProgress progress = childProgressRepository.findByChildId(child.getId())
                .orElseGet(() -> childProgressRepository.save(new ChildProgress(child, 0, "alphabet")));

        return buildResponse(progress);
    }

    @Transactional(readOnly = true)
    public ProgressResponse getProgressForParent(String parentUsername, TokenService.TokenClaims claims) {
        if (parentUsername == null || parentUsername.trim().isEmpty()) {
            throw new IllegalArgumentException("Parent username is required.");
        }
        final String pName = parentUsername.trim();

        // 1. Role verification: Must be PARENT
        if (!"PARENT".equalsIgnoreCase(claims.getRole())) {
            throw new BadCredentialsException("Access denied: Authenticated user has role " + claims.getRole()
                    + ". Only registered PARENT accounts may query parent dashboard progress.");
        }

        // 2. Identity verification: Must match authenticated parent
        if (!claims.getUsername().equalsIgnoreCase(pName)) {
            throw new BadCredentialsException("Access denied: Authenticated parent '" + claims.getUsername()
                    + "' cannot query progress for parent '" + pName + "'.");
        }

        User parent = userRepository.findByUsername(pName)
                .orElseThrow(() -> new IllegalArgumentException("Parent account '" + pName + "' is not registered."));

        if (!"PARENT".equalsIgnoreCase(parent.getRole())) {
            throw new IllegalArgumentException("User '" + pName + "' is not a PARENT account.");
        }

        // Check if parent has a linked registered child
        List<User> children = userRepository.findByParentUsername(pName);
        if (!children.isEmpty()) {
            return getProgress(children.get(0).getUsername(), claims);
        }

        // Default to Leo or zero stars if no linked child
        return userRepository.findByUsername("Leo")
                .filter(u -> "CHILD".equalsIgnoreCase(u.getRole()))
                .map(u -> getProgress("Leo", claims))
                .orElse(new ProgressResponse("Leo", 0, "alphabet", 0, "None"));
    }

    @Transactional
    public ProgressResponse addStars(StarUpdateRequest request, TokenService.TokenClaims claims) {
        String rawName = request.getUsername();
        if (rawName == null || rawName.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required to award stars.");
        }
        final String name = rawName.trim();

        // 1. Role verification: Only CHILD accounts may earn stars
        if (!"CHILD".equalsIgnoreCase(claims.getRole())) {
            throw new BadCredentialsException("Access denied: Authenticated user has role " + claims.getRole()
                    + ". Stars can only be earned by registered CHILD accounts.");
        }

        // 2. Identity check: Token subject must match child username
        if (!claims.getUsername().equalsIgnoreCase(name)) {
            throw new BadCredentialsException("Access denied: Authenticated child '" + claims.getUsername()
                    + "' cannot modify progress for child '" + name + "'.");
        }

        // 3. Fetch child from MySQL
        User child = userRepository.findByUsername(name)
                .orElseThrow(() -> new IllegalArgumentException("Child account '" + name + "' is not registered."));

        if (!"CHILD".equalsIgnoreCase(child.getRole())) {
            throw new IllegalArgumentException("User '" + name + "' has role " + child.getRole()
                    + ". Stars can only be earned by registered CHILD accounts.");
        }

        int starsToAdd = request.getStarsToAdd() != null && request.getStarsToAdd() > 0 ? request.getStarsToAdd() : 1;

        ChildProgress progress = childProgressRepository.findByChildId(child.getId())
                .orElseGet(() -> new ChildProgress(child, 0, request.getGameId()));

        progress.setStars(progress.getStars() + starsToAdd);
        if (request.getGameId() != null && !request.getGameId().isBlank()) {
            progress.setLastGame(request.getGameId());
        }
        progress.setUpdatedAt(LocalDateTime.now());

        ChildProgress saved = childProgressRepository.save(progress);
        return buildResponse(saved);
    }

    private ProgressResponse buildResponse(ChildProgress progress) {
        int stars = progress.getStars();
        int discount = 0;
        String tier = "None";

        if (stars >= 50) {
            discount = 20;
            tier = "Champion";
        } else if (stars >= 25) {
            discount = 15;
            tier = "Super Star";
        } else if (stars >= 10) {
            discount = 10;
            tier = "Star Learner";
        }

        return new ProgressResponse(
                progress.getChild().getUsername(),
                stars,
                progress.getLastGame(),
                discount,
                tier
        );
    }
}
