package com.Sticky_notes.Sticky_notes.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull; // Import for @NonNull
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class to enable CORS for the application.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**") // Allow CORS for all endpoints
                .allowedOrigins("http://localhost:5173") // Frontend origin (Vite)
                .allowedMethods("GET", "POST", "PUT", "DELETE") // Supported HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(false) // No credentials needed
                .maxAge(3600); // Cache CORS preflight for 1 hour
    }
}