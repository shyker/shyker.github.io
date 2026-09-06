package com.shyler.blog.content;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminAuthFilter extends OncePerRequestFilter {
    private final AdminTokenService tokens;
    public AdminAuthFilter(AdminTokenService tokens) { this.tokens = tokens; }

    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !path.startsWith("/api/admin/") || path.equals("/api/admin/auth/login") || "OPTIONS".equals(request.getMethod());
    }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ") || !tokens.valid(auth.substring(7))) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Admin session is missing or expired\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
