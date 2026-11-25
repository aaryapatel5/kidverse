package com.kidverse.service;

import com.kidverse.exception.BadCredentialsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * High-Security Cryptographic Token Service.
 * Implements HMAC-SHA256 signed bearer tokens with expiration, constant-time signature verification,
 * and authenticated claims extraction.
 * Replaces unauthenticated X-Username header reliance.
 */
@Service
public class TokenService {

    private static final String HMAC_ALGO = "HmacSHA256";
    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000L; // 24 hours validity

    private final byte[] secretKeyBytes;

    public TokenService(@Value("${jwt.secret:}") String secret) {
        if (secret == null || secret.trim().isEmpty() || secret.trim().length() < 32) {
            throw new IllegalStateException("FATAL SECURITY CONFIGURATION: 'jwt.secret' (JWT_SECRET) is missing, empty, or shorter than 32 characters (256 bits). A strong cryptographic secret must be provided via the JWT_SECRET environment variable.");
        }
        this.secretKeyBytes = secret.trim().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Generates a tamper-proof HMAC-SHA256 signed bearer token.
     * Format: Base64Url(username:role:issuedAt:expiry) . Base64Url(HMAC-SHA256 signature)
     */
    public String generateToken(String username, String role) {
        if (username == null || role == null) {
            throw new IllegalArgumentException("Username and role are required to issue token.");
        }
        long now = System.currentTimeMillis();
        long expiry = now + EXPIRATION_MS;
        String payload = username.trim() + ":" + role.trim().toUpperCase() + ":" + now + ":" + expiry;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = computeHmac(encodedPayload);
        return encodedPayload + "." + signature;
    }

    /**
     * Validates an Authorization Bearer token header.
     * Rejects missing, malformed, forged, or expired tokens with BadCredentialsException (HTTP 401).
     */
    public TokenClaims validateAndExtract(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new BadCredentialsException("Authentication required: Missing Authorization token. Please log in to obtain a valid Bearer token.");
        }

        String token = authHeader.trim();
        if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
            token = token.substring(7).trim();
        }

        int dotIndex = token.lastIndexOf('.');
        if (dotIndex <= 0) {
            throw new BadCredentialsException("Authentication failed: Invalid token format.");
        }

        String encodedPayload = token.substring(0, dotIndex);
        String providedSignature = token.substring(dotIndex + 1);

        String expectedSignature = computeHmac(encodedPayload);
        if (!constantTimeEquals(expectedSignature, providedSignature)) {
            throw new BadCredentialsException("Access denied: Invalid or forged authentication token signature.");
        }

        String payload;
        try {
            payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new BadCredentialsException("Authentication failed: Invalid token encoding.");
        }

        String[] parts = payload.split(":");
        if (parts.length < 4) {
            throw new BadCredentialsException("Authentication failed: Malformed token payload.");
        }

        String username = parts[0];
        String role = parts[1];
        long expiry;
        try {
            expiry = Long.parseLong(parts[3]);
        } catch (NumberFormatException e) {
            throw new BadCredentialsException("Authentication failed: Invalid token expiry timestamp.");
        }

        if (System.currentTimeMillis() > expiry) {
            throw new BadCredentialsException("Session expired: Authentication token has expired. Please log in again.");
        }

        return new TokenClaims(username, role);
    }

    private String computeHmac(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(secretKeyBytes, HMAC_ALGO));
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error computing cryptographic HMAC signature", e);
        }
    }

    /**
     * Constant-time string comparison to prevent side-channel timing attacks.
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    /**
     * Authenticated claims extracted from a verified token.
     */
    public static class TokenClaims {
        private final String username;
        private final String role;

        public TokenClaims(String username, String role) {
            this.username = username;
            this.role = role;
        }

        public String getUsername() {
            return username;
        }

        public String getRole() {
            return role;
        }
    }
}
