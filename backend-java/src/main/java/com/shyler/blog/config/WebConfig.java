package com.shyler.blog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /** Directory where uploaded diary images are persisted (Next.js public/). */
    static final String IMAGE_DIR = "../public/diaries/images";

    @Value("${app.content.media-dir}")
    private String mediaDir;

    @Value("${app.cors.origins}")
    private String corsOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(Arrays.stream(corsOrigins.split(",")).map(String::trim).toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-Diary-Password", "If-None-Match")
                .exposedHeaders("ETag")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path abs = Paths.get(IMAGE_DIR).toAbsolutePath().normalize();
        registry.addResourceHandler("/api/diaries/images/**")
                .addResourceLocations("file:" + abs.toString().replace("\\", "/") + "/");

        Path media = Paths.get(mediaDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/media/**")
                .addResourceLocations("file:" + media.toString().replace("\\", "/") + "/")
                .setCachePeriod(31536000);
    }
}
