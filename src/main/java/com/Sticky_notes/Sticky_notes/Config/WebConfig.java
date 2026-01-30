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
                .allowedOrigins(
                    "http://localhost:5173", 
                    "http://localhost:5174", 
                    "http://localhost:8081", 
                    "http://localhost:8082",
                    "https://sticky-notes-frontend-oyj73tnptq-ew.a.run.app",
                    "https://sticky-notes-frontend-1077104673800.europe-west1.run.app",
                    "http://192.168.10.92:5173"
                ) // Frontend origins including Cloud Run
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Supported HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true) // Allow credentials
                .maxAge(3600); // Cache CORS preflight for 1 hour
    }
}