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
        config.addAllowedOrigin("http://localhost:5173"); // Your frontend URL
        config.addAllowedMethod("*"); // Allow all HTTP methods (GET, POST, etc.)
        config.addAllowedHeader("*"); // Allow all headers
        config.setAllowCredentials(true); // If you need credentials like cookies or authorization headers
        source.registerCorsConfiguration("/**", config); // Allow all API routes
        return new CorsFilter(source);
    }
}
