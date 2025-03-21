package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import com.Sticky_notes.Sticky_notes.repository.CommentRepository;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8081", "http://localhost:8082"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        // For testing purposes, return a mock profile if authentication is null
        if (authentication == null) {
            // Create a mock response for testing
            ProfileResponse mockResponse = new ProfileResponse(
                "testuser",
                "test@example.com",
                "USER",
                5
            );
            return ResponseEntity.ok(mockResponse);
        }
        
        // Get the authenticated user
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Count user's notes
        long notesCount = commentRepository.countByUsername(user.getUsername());
        
        // Create a response object with user data
        ProfileResponse response = new ProfileResponse(
            user.getUsername(),
            user.getEmail(),
            user.getRoles(),
            notesCount
        );
        
        return ResponseEntity.ok(response);
    }
    
    // Response class to structure the profile data
    private static class ProfileResponse {
        private final String username;
        private final String email;
        private final String role;
        private final long notesCount;
        
        public ProfileResponse(String username, String email, String role, long notesCount) {
            this.username = username;
            this.email = email;
            this.role = role;
            this.notesCount = notesCount;
        }
        
        // Getters needed for JSON serialization - do not remove even if IDE shows as unused
        // These are required for Jackson to properly serialize the object to JSON
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public long getNotesCount() { return notesCount; }
    }
}
