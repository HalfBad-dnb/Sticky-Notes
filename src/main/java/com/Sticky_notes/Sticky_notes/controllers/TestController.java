package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Value;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    @Value("${server.port:8080}")
    private String serverPort;
    
    // Environment will be used in future enhancements if needed

    @GetMapping
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint is working!");
        response.put("port", serverPort);
        response.put("portEnv", System.getenv("PORT"));
        return response;
    }
}
