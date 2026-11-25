package com.kidverse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * Service to send transactional emails via Brevo (formerly Sendinblue) REST API.
 * Uses POST https://api.brevo.com/v3/smtp/email
 * 
 * SECURITY:
 * - API Key is loaded strictly from environment/properties
 * - API Key is NEVER logged, returned in responses, or exposed to frontend
 */
@Service
public class BrevoEmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final String apiKey;
    private final String senderEmail;
    private final String senderName;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public BrevoEmailService(
            @Value("${brevo.api.key:}") String apiKey,
            @Value("${brevo.sender.email:cdiya2460@gmail.com}") String senderEmail,
            @Value("${brevo.sender.name:KIDVERSE}") String senderName,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.senderEmail = senderEmail != null ? senderEmail.trim() : "cdiya2460@gmail.com";
        this.senderName = senderName != null ? senderName.trim() : "KIDVERSE";
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Sends a 6-digit OTP verification code to the recipient email address using Brevo Transactional Email API.
     * 
     * @param recipientEmail destination email address
     * @param otp 6-digit verification code
     */
    public void sendOtpEmail(String recipientEmail, String otp) {
        if (apiKey.isEmpty()) {
            log.error("Brevo API key is not configured. Unable to send transactional OTP email.");
            throw new IllegalStateException("Email service is temporarily unavailable: Brevo API key is not configured in backend environment.");
        }

        if (recipientEmail == null || recipientEmail.isBlank()) {
            throw new IllegalArgumentException("Recipient email address cannot be empty.");
        }

        try {
            Map<String, Object> payload = buildEmailPayload(recipientEmail.trim(), otp);
            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            log.info("Sending OTP verification email via Brevo to: {}", maskEmail(recipientEmail));
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();
            if (status >= 200 && status < 300) {
                log.info("Brevo email sent successfully. Status: {}", status);
            } else {
                String responseBody = response.body();
                log.error("Brevo API responded with error status: {}. Response: {}", status, responseBody);
                String errorMessage = "Failed to send verification email via Brevo (HTTP " + status + ").";
                try {
                    Map<?, ?> map = objectMapper.readValue(responseBody, Map.class);
                    if (map != null && map.containsKey("message")) {
                        errorMessage = "Brevo Email Service: " + map.get("message");
                    }
                } catch (Exception ignore) {}
                throw new RuntimeException(errorMessage);
            }
        } catch (IOException | InterruptedException e) {
            log.error("Network or I/O error occurred while communicating with Brevo API: {}", e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to deliver OTP email: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> buildEmailPayload(String recipientEmail, String otp) {
        Map<String, Object> payload = new HashMap<>();

        // Sender format as specified by Brevo
        Map<String, String> sender = new HashMap<>();
        sender.put("name", senderName);
        sender.put("email", senderEmail);
        payload.put("sender", sender);

        // Recipient
        List<Map<String, String>> toList = new ArrayList<>();
        Map<String, String> to = new HashMap<>();
        to.put("email", recipientEmail);
        toList.add(to);
        payload.put("to", toList);

        payload.put("subject", "Your KIDVERSE 6-Digit Verification Code: " + otp);

        String htmlContent = buildHtmlTemplate(otp);
        payload.put("htmlContent", htmlContent);

        String textContent = "Your KIDVERSE 6-digit verification code is: " + otp + "\n\n"
                + "This OTP code expires in 5 minutes.\n"
                + "Please do not share this code with anyone for account safety.\n\n"
                + "Best regards,\nThe KIDVERSE Team";
        payload.put("textContent", textContent);

        return payload;
    }

    private String buildHtmlTemplate(String otp) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<title>KIDVERSE Verification Code</title>"
                + "</head>"
                + "<body style='margin:0;padding:0;background-color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;'>"
                + "<div style='max-width:560px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6;'>"
                + "  <div style='background:linear-gradient(135deg, #6366f1 0%, #a855f7 100%);padding:36px 30px;text-align:center;'>"
                + "    <h1 style='color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:1px;'>KIDVERSE</h1>"
                + "    <p style='color:#e0e7ff;margin:8px 0 0;font-size:14px;font-weight:500;'>Learning & Fun Universe</p>"
                + "  </div>"
                + "  <div style='padding:40px 32px;text-align:center;color:#1e293b;'>"
                + "    <h2 style='font-size:22px;font-weight:700;margin:0 0 12px;color:#0f172a;'>Verification Code</h2>"
                + "    <p style='font-size:15px;color:#64748b;margin:0 0 28px;line-height:1.5;'>"
                + "      Please use the following 6-digit one-time password (OTP) to authenticate your KIDVERSE account."
                + "    </p>"
                + "    <div style='background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:20px;margin:0 auto 28px;display:inline-block;min-width:240px;'>"
                + "      <span style='font-size:38px;font-weight:800;letter-spacing:8px;color:#4f46e5;font-family:monospace;display:block;'>"
                + otp
                + "      </span>"
                + "    </div>"
                + "    <div style='background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:12px 16px;margin:0 0 28px;text-align:left;'>"
                + "      <p style='margin:0;color:#991b1b;font-size:14px;font-weight:600;'>"
                + "        ⏱️ This OTP code expires in 5 minutes."
                + "      </p>"
                + "      <p style='margin:4px 0 0;color:#b91c1c;font-size:13px;'>"
                + "        For security reasons, never share this code with anyone."
                + "      </p>"
                + "    </div>"
                + "    <p style='font-size:13px;color:#94a3b8;margin:0;line-height:1.5;'>"
                + "      If you did not request this verification code, you can safely ignore this email."
                + "    </p>"
                + "  </div>"
                + "  <div style='background:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;'>"
                + "    © " + java.time.Year.now().getValue() + " KIDVERSE. All rights reserved."
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@", 2);
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.substring(0, 2) + "***@" + domain;
    }
}
