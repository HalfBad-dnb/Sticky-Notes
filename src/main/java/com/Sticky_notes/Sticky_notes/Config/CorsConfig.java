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
        config.addAllowedOrigin("http://192.168.10.92:5173"); // Local network access
        config.addAllowedOrigin("http://192.168.10.97:5173"); // linux home machine connection 
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
        
        // Explicitly allow authorization header for JWT
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Access-Control-Allow-Headers");
        config.addExposedHeader("Access-Control-Allow-Origin");
        config.addExposedHeader("Access-Control-Allow-Methods");
        config.addExposedHeader("Access-Control-Allow-Credentials");
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Set max age for preflight requests (1 hour)
        config.setMaxAge(3600L);
        
        // Apply to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
