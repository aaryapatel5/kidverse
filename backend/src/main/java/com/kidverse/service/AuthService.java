package com.kidverse.service;

import com.kidverse.dto.AuthResponse;
import com.kidverse.dto.LoginRequest;
import com.kidverse.dto.RegisterRequest;
import com.kidverse.entity.ChildProgress;
import com.kidverse.entity.User;
import com.kidverse.repository.ChildProgressRepository;
import com.kidverse.repository.UserRepository;
import com.kidverse.exception.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ChildProgressRepository childProgressRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository,
                       ChildProgressRepository childProgressRepository,
                       PasswordEncoder passwordEncoder,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.childProgressRepository = childProgressRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    /**
     * Authenticates an EXISTING user.
     * NEVER creates or registers a user inside login.
     * Rejects unknown usernames, incorrect passwords, and mismatched account roles.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new BadCredentialsException("Username is required.");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new BadCredentialsException("Password is required.");
        }

        String username = request.getUsername().trim();
        String password = request.getPassword();
        String requestedRole = request.getUserType() != null ? request.getUserType().toUpperCase() : null;

        // 1. Check if user exists in the MySQL database - NEVER create user here
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials: User '" + username + "' is not registered."));

        // 2. Validate role matching (Parent login rejects CHILD accounts; Child login rejects PARENT accounts)
        if (requestedRole != null && !requestedRole.equalsIgnoreCase(user.getRole())) {
            if ("PARENT".equalsIgnoreCase(requestedRole)) {
                throw new BadCredentialsException("Access denied: '" + username + "' is registered as a CHILD account. Please use Child Login.");
            } else if ("CHILD".equalsIgnoreCase(requestedRole)) {
                throw new BadCredentialsException("Access denied: '" + username + "' is registered as a PARENT account. Please use Parent Login.");
            } else {
                throw new BadCredentialsException("Access denied: Role mismatch for user '" + username + "'.");
            }
        }

        // 3. Verify password strictly using BCrypt
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials: Incorrect password.");
        }

        // 4. Retrieve child stars if role is CHILD
        Integer stars = 0;
        if ("CHILD".equalsIgnoreCase(user.getRole())) {
            stars = childProgressRepository.findByChildId(user.getId())
                    .map(ChildProgress::getStars)
                    .orElse(0);
        }

        String token = tokenService.generateToken(user.getUsername(), user.getRole());

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                "Login successful",
                stars,
                token
        );
    }

    /**
     * Dedicated registration API.
     * Creates new user, hashes password with BCrypt, and stores in MySQL.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required ('PARENT' or 'CHILD').");
        }

        String username = request.getUsername().trim();
        String role = request.getRole().trim().toUpperCase();

        if (!"PARENT".equals(role) && !"CHILD".equals(role)) {
            throw new IllegalArgumentException("Invalid role. Must be 'PARENT' or 'CHILD'.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' already exists. Please choose a different username.");
        }

        User user = new User(
                username,
                request.getEmail() != null ? request.getEmail().trim() : null,
                passwordEncoder.encode(request.getPassword()),
                role
        );

        if (request.getParentUsername() != null && !request.getParentUsername().isBlank()) {
            userRepository.findByUsername(request.getParentUsername().trim()).ifPresent(user::setParent);
        }

        user = userRepository.save(user);

        if ("CHILD".equalsIgnoreCase(user.getRole())) {
            ChildProgress progress = new ChildProgress(user, 0, "alphabet");
            childProgressRepository.save(progress);
        }

        String token = tokenService.generateToken(user.getUsername(), user.getRole());

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                "Registration successful",
                0,
                token
        );
    }
}
