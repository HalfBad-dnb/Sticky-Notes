package com.Sticky_notes.Sticky_notes.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow specific origins
        config.addAllowedOrigin("http://localhost:5173"); // Development frontend URL
        config.addAllowedOrigin("http://localhost:5174"); // Development frontend URL (Vite)
        config.addAllowedOrigin("http://localhost:8081"); // Production frontend URL
        config.addAllowedOrigin("http://localhost:8082"); // Additional frontend URL
        config.addAllowedOrigin("https://sticky-notes-frontend-oyj73tnptq-ew.a.run.app"); // Cloud Run frontend URL
        // Allow any subdomain of run.app (for Cloud Run deployments)
        config.addAllowedOriginPattern("https://*.run.app");
        
        // Allow all HTTP methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Set max age for preflight requests
        config.setMaxAge(3600L);
        
        // Apply to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
