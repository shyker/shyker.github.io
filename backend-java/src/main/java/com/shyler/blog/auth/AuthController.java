package com.shyler.blog.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight auth endpoint so the frontend can verify a password
 * before storing it for subsequent API calls.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${app.auth.password}")
    private String password;

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        String provided = body.get("password");
        if (provided != null && provided.equals(password)) {
            return ResponseEntity.ok(Map.of("valid", true));
        }
        return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Invalid password"));
    }
}
