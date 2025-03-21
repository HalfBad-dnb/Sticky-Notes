package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.Sticky_notes.Sticky_notes.models.Register;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8081", "http://localhost:8082"})
@RequestMapping("/api/registration")
public class RegistrationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody Register registerRequest) {
        // Validate password match
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }
        
        // Check if the username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        
        // Create new user from registration request
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        
        // Encode the password before saving the user
        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
        user.setPassword(encodedPassword);
        
        // Set default role
        user.setRoles("USER");
        
        // Save the user to the database
        User savedUser = userRepository.save(user);
        
        // Return success response
        return ResponseEntity.ok().body("User registered successfully");
    }

    // Optionally, you can add a check if a username is already taken
    @GetMapping("/check-username/{username}")
    public boolean checkUsernameAvailability(@PathVariable String username) {
        return !userRepository.existsByUsername(username);
    }
}
