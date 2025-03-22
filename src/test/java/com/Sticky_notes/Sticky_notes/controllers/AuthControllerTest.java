package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User("testuser", "password123", "USER");
    }

    @Test
    void registerSuccess() {
        // Arrange
        when(authService.registerUser(any(User.class))).thenReturn(true);

        // Act
        ResponseEntity<String> response = authController.register(testUser);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("User registered successfully", response.getBody());
    }

    @Test
    void registerFailure() {
        // Arrange
        when(authService.registerUser(any(User.class))).thenReturn(false);

        // Act
        ResponseEntity<String> response = authController.register(testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("User registration failed", response.getBody());
    }

    @Test
    void loginSuccess() {
        // Arrange
        when(authService.authenticateUser(any(User.class))).thenReturn(true);

        // Act
        ResponseEntity<?> response = authController.login(testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // We can't check the exact token as it's dynamic, but we can check that the response is not null
        assertNotNull(response.getBody());
    }

    @Test
    void loginFailure() {
        // Arrange
        when(authService.authenticateUser(any(User.class))).thenReturn(false);

        // Act
        ResponseEntity<?> response = authController.login(testUser);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid username or password", response.getBody());
    }
}
