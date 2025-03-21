package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Endpoint to register a new user
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        boolean isRegistered = authService.registerUser(user);
        if (isRegistered) {
            return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
        }
        return new ResponseEntity<>("User registration failed", HttpStatus.BAD_REQUEST);
    }

    // Endpoint for user login (using username and password)
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        boolean isAuthenticated = authService.authenticateUser(user);
        if (isAuthenticated) {
            return new ResponseEntity<>("Login successful", HttpStatus.OK);
        }
        return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
    }
}
