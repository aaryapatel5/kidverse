package com.kidverse.service;

import com.kidverse.dto.*;
import com.kidverse.entity.ChildProgress;
import com.kidverse.entity.EmailOtp;
import com.kidverse.entity.User;
import com.kidverse.exception.BadCredentialsException;
import com.kidverse.repository.ChildProgressRepository;
import com.kidverse.repository.EmailOtpRepository;
import com.kidverse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final ChildProgressRepository childProgressRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final BrevoEmailService brevoEmailService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       ChildProgressRepository childProgressRepository,
                       EmailOtpRepository emailOtpRepository,
                       BrevoEmailService brevoEmailService,
                       PasswordEncoder passwordEncoder,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.childProgressRepository = childProgressRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.brevoEmailService = brevoEmailService;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    /**
     * Authenticates an EXISTING user with username/password.
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
                .or(() -> userRepository.findByEmail(username))
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

        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        if (email != null && !email.isEmpty() && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email '" + email + "' already exists.");
        }

        User user = new User(
                username,
                email,
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

    /**
     * Generates a 6-digit OTP code, stores it with 5-minute expiry in MySQL,
     * and sends it via Brevo Transactional Email.
     */
    @Transactional
    public Map<String, Object> sendOtp(SendOtpRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String purpose = request.getPurpose() != null ? request.getPurpose().trim().toUpperCase() : "VERIFY";

        // If purpose is LOGIN, verify that the user exists in MySQL
        if ("LOGIN".equals(purpose)) {
            boolean userExists = userRepository.existsByEmail(email) || userRepository.existsByUsername(email);
            if (!userExists) {
                throw new BadCredentialsException("No registered account found with email '" + email + "'. Please sign up first.");
            }
        }

        // If purpose is REGISTER, optionally verify that the email is not already taken
        if ("REGISTER".equals(purpose)) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("An account with email '" + email + "' already exists. Please log in.");
            }
        }

        // Generate cryptographically secure 6-digit OTP
        int code = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(code);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        // Save OTP record to MySQL database
        EmailOtp emailOtp = new EmailOtp(email, otp, expiresAt);
        emailOtpRepository.save(emailOtp);

        // Send OTP via Brevo API
        brevoEmailService.sendOtpEmail(email, otp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "A 6-digit verification code has been sent to your email. It expires in 5 minutes.");
        response.put("email", email);
        return response;
    }

    /**
     * Verifies the provided 6-digit OTP code against the latest valid entry in MySQL.
     */
    @Transactional
    public Map<String, Object> verifyOtp(VerifyOtpRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            throw new IllegalArgumentException("OTP code is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String submittedOtp = request.getOtp().trim();

        EmailOtp latestOtp = emailOtpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadCredentialsException("No verification request found for email: " + email));

        if (latestOtp.isVerified()) {
            throw new BadCredentialsException("This verification code has already been used. Please request a new one.");
        }

        if (latestOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("This verification code has expired (valid for 5 minutes). Please request a new code.");
        }

        if (!latestOtp.getOtp().equals(submittedOtp)) {
            throw new BadCredentialsException("Invalid verification code. Please check and try again.");
        }

        latestOtp.setVerified(true);
        emailOtpRepository.save(latestOtp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Email verified successfully.");
        response.put("email", email);
        response.put("verified", true);
        return response;
    }

    /**
     * Authenticates a user using Brevo Email 6-digit OTP.
     * NEVER auto-registers or creates a user inside login.
     * Rejects nonexistent accounts, expired OTPs, incorrect codes, and role mismatches.
     */
    @Transactional
    public AuthResponse loginWithOtp(OtpLoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadCredentialsException("Email address is required.");
        }
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            throw new BadCredentialsException("OTP verification code is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String submittedOtp = request.getOtp().trim();
        String requestedRole = request.getUserType() != null ? request.getUserType().toUpperCase() : null;

        // 1. Verify OTP
        EmailOtp latestOtp = emailOtpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadCredentialsException("No verification request found for email: " + email));

        if (latestOtp.isVerified()) {
            throw new BadCredentialsException("This OTP has already been used. Please request a new verification code.");
        }

        if (latestOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("This OTP code has expired. Please request a new 6-digit code.");
        }

        if (!latestOtp.getOtp().equals(submittedOtp)) {
            throw new BadCredentialsException("Invalid verification code. Please check and try again.");
        }

        // Mark OTP as used
        latestOtp.setVerified(true);
        emailOtpRepository.save(latestOtp);

        // 2. Fetch user from MySQL - NEVER create a user inside login
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(email))
                .orElseThrow(() -> new BadCredentialsException("No registered account found with email '" + email + "'. Please register first."));

        // 3. Role enforcement
        if (requestedRole != null && !requestedRole.equalsIgnoreCase(user.getRole())) {
            if ("PARENT".equalsIgnoreCase(requestedRole)) {
                throw new BadCredentialsException("Access denied: Account is registered as a CHILD account. Please use Child Login.");
            } else if ("CHILD".equalsIgnoreCase(requestedRole)) {
                throw new BadCredentialsException("Access denied: Account is registered as a PARENT account. Please use Parent Login.");
            } else {
                throw new BadCredentialsException("Access denied: Role mismatch for user account.");
            }
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
                "OTP Login successful",
                stars,
                token
        );
    }
}
