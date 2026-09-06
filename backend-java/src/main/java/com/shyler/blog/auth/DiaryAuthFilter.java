package com.shyler.blog.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Simple password-based auth filter for {@code /api/diaries/**} routes.
 *
 * <p>Read requests (GET) are allowed without authentication so the diary
 * list can be viewed publicly. All write operations (POST, PUT, DELETE)
 * and the upload endpoint require the {@code X-Diary-Password} header to
 * match the configured {@code app.auth.password} value.</p>
 */
@Component
public class DiaryAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(DiaryAuthFilter.class);

    private static final String HEADER_NAME = "X-Diary-Password";

    @Value("${app.auth.password}")
    private String password;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Only apply to diary API routes
        return !path.startsWith("/api/diaries");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String method = request.getMethod();

        // GET is public
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            chain.doFilter(request, response);
            return;
        }

        String provided = request.getHeader(HEADER_NAME);

        if (provided == null || !provided.equals(password)) {
            log.warn("Unauthorized {} request to {} (bad or missing password)", method, request.getRequestURI());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized — invalid or missing password\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
