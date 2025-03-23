package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.models.Profile;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import com.Sticky_notes.Sticky_notes.repository.CommentRepository;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8080", "http://localhost:8081"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        // Check if user is authenticated
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        
        // Get the authenticated user
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Count user's notes
        long notesCount = commentRepository.countByUsername(user.getUsername());
        
        // Create a Profile object with user data
        Profile profile = new Profile(
            user.getUsername(),
            user.getEmail(),
            user.getRoles(),
            notesCount
        );
        
        return ResponseEntity.ok(profile);
    }
    
    // We now use the Profile model class instead of this inner class
}
