package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

@RestController
public class HealthCheckController {

    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;
    
    @Autowired
    private Environment environment;

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("serverPort", serverPort);
        response.put("activeProfiles", Arrays.asList(environment.getActiveProfiles()));
        response.put("port", System.getenv("PORT"));
        
        // Add environment variables for debugging
        Map<String, String> envVars = new HashMap<>();
        envVars.put("PORT", System.getenv("PORT"));
        envVars.put("SPRING_PROFILES_ACTIVE", System.getenv("SPRING_PROFILES_ACTIVE"));
        envVars.put("SPRING_DATASOURCE_URL", maskSensitiveInfo(System.getenv("SPRING_DATASOURCE_URL")));
        response.put("environment", envVars);
        
        return response;
    }
    
    private String maskSensitiveInfo(String input) {
        if (input == null) {
            return null;
        }
        // Mask password if present
        return input.replaceAll("password=[^&]*", "password=*****");
    }
}
