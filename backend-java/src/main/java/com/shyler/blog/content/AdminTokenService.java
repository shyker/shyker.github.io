package com.shyler.blog.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class AdminTokenService {
    private final ObjectMapper mapper;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    @Value("${app.admin.password-hash:}") private String passwordHash;
    @Value("${app.admin.development-password:}") private String developmentPassword;
    @Value("${app.admin.jwt-secret}") private String secret;
    @Value("${app.admin.token-hours:8}") private long tokenHours;

    public AdminTokenService(ObjectMapper mapper) { this.mapper = mapper; }

    public boolean passwordMatches(String password) {
        if (password == null) return false;
        if (passwordHash != null && !passwordHash.isBlank()) return bcrypt.matches(password, passwordHash);
        return developmentPassword != null && MessageDigest.isEqual(
                developmentPassword.getBytes(StandardCharsets.UTF_8), password.getBytes(StandardCharsets.UTF_8));
    }

    public String issue() {
        try {
            String header = encode(mapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String payload = encode(mapper.writeValueAsBytes(Map.of(
                    "sub", "blog-admin", "iat", Instant.now().getEpochSecond(),
                    "exp", Instant.now().plusSeconds(tokenHours * 3600).getEpochSecond())));
            String unsigned = header + "." + payload;
            return unsigned + "." + sign(unsigned);
        } catch (Exception e) {
            throw new IllegalStateException("Could not issue admin token", e);
        }
    }

    public boolean valid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;
            String unsigned = parts[0] + "." + parts[1];
            if (!MessageDigest.isEqual(sign(unsigned).getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) return false;
            @SuppressWarnings("unchecked") Map<String, Object> payload = mapper.readValue(Base64.getUrlDecoder().decode(parts[1]), Map.class);
            return "blog-admin".equals(payload.get("sub")) && ((Number) payload.get("exp")).longValue() > Instant.now().getEpochSecond();
        } catch (Exception ignored) { return false; }
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return encode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private static String encode(byte[] bytes) { return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
}
