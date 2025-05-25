package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.payload.request.LoginRequest;
import com.Sticky_notes.Sticky_notes.security.JwtTokenProvider;
import com.Sticky_notes.Sticky_notes.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private AuthService authService;
    
    @Mock
    private AuthenticationManager authenticationManager;
    
    @Mock
    private JwtTokenProvider tokenProvider;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AuthController authController;
    
    private User testUser;
    private LoginRequest loginRequest;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User("testuser", "test@example.com", "password123", "ROLE_USER");
        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
    }

    @Test
    void registerUser_Success() {
        // Arrange
        when(authService.existsByUsername(anyString())).thenReturn(false);
        when(authService.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(authService.registerUser(any(User.class))).thenReturn(true);
        
        // Act
        ResponseEntity<?> response = authController.registerUser(testUser);
        
        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals("User registered successfully!", response.getBody());
        verify(authService, times(1)).registerUser(any(User.class));
    }
    
    @Test
    void registerUser_UsernameTaken() {
        // Arrange
        when(authService.existsByUsername(anyString())).thenReturn(true);
        
        // Act
        ResponseEntity<?> response = authController.registerUser(testUser);
        
        // Assert
        assertTrue(response.getStatusCode().is4xxClientError());
        assertEquals("Error: Username is already taken!", response.getBody());
        verify(authService, never()).registerUser(any(User.class));
    }
    
    @Test
    void registerUser_EmailInUse() {
        // Arrange
        when(authService.existsByUsername(anyString())).thenReturn(false);
        when(authService.existsByEmail(anyString())).thenReturn(true);
        
        // Act
        ResponseEntity<?> response = authController.registerUser(testUser);
        
        // Assert
        assertTrue(response.getStatusCode().is4xxClientError());
        assertEquals("Error: Email is already in use!", response.getBody());
        verify(authService, never()).registerUser(any(User.class));
    }
    
    @Test
    void authenticateUser_Success() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(authService.getUserByUsername(anyString())).thenReturn(testUser);
        when(tokenProvider.generateToken(any(Authentication.class))).thenReturn("testToken");
        
        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);
        
        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
