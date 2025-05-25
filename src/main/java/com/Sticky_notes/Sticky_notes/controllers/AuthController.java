package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.payload.request.LoginRequest;
import com.Sticky_notes.Sticky_notes.security.JwtTokenProvider;
import com.Sticky_notes.Sticky_notes.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8080", "http://localhost:8081"}, 
    allowedHeaders = "*", 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, 
    allowCredentials = "true")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Log the login attempt
            System.out.println("Login attempt for user: " + loginRequest.getUsername());
            
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            // Set the authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get user details
            User user = authService.getUserByUsername(loginRequest.getUsername());
            if (user == null) {
                System.out.println("User not found in database after authentication");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User not found in database after authentication");
            }
            
            System.out.println("User found: " + user.getUsername() + " with role: " + user.getRoles());
            
            // Generate JWT token and refresh token
            String jwt = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());
            
            // Get user role as a single-item list
            List<String> roles = new java.util.ArrayList<>();
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                roles.add(user.getRoles());
            } else {
                // Default role if none is set
                roles.add("ROLE_USER");
            }
            
            // Log successful authentication
            System.out.println("Authentication successful for user: " + user.getUsername());
            
            // Create response with both tokens
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("refreshToken", refreshToken);
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("roles", roles);
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            System.out.println("Bad credentials for user: " + loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
            
        } catch (Exception e) {
            System.out.println("Error during authentication: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during authentication");
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (authService.existsByUsername(user.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body("Error: Username is already taken!");
        }
        
        if (authService.existsByEmail(user.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body("Error: Email is already in use!");
        }
        
        // Create new user's account
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        boolean isRegistered = authService.registerUser(user);
        if (isRegistered) {
            return ResponseEntity.ok("User registered successfully!");
        }
        
        return ResponseEntity.badRequest().body("Error: Registration failed!");
    }
    
    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshToken(@RequestParam String refreshToken) {
        try {
            if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
                String username = tokenProvider.getUsernameFromToken(refreshToken);
                User user = authService.getUserByUsername(username);
                
                if (user != null) {
                    String token = tokenProvider.generateTokenFromUsername(username);
                    String newRefreshToken = tokenProvider.generateRefreshToken(username);
                    
                    // Get user role as a single-item list
                    List<String> roles = new java.util.ArrayList<>();
                    if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                        roles.add(user.getRoles());
                    } else {
                        // Default role if none is set
                        roles.add("ROLE_USER");
                    }
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("refreshToken", newRefreshToken);
                    response.put("id", user.getId());
                    response.put("username", user.getUsername());
                    response.put("email", user.getEmail());
                    response.put("roles", roles);
                    
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.badRequest().body("Error: Invalid refresh token");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
