package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private User savedUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Create test user
        testUser = new User("testuser", "password123", "USER");
        
        // Create saved user with encoded password
        savedUser = new User("testuser", "encodedPassword", "USER");
        
        // Mock password encoder
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    }

    @Test
    void registerUserSuccess() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        boolean result = authService.registerUser(testUser);

        // Assert
        assertTrue(result);
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUserFailureUsernameExists() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(savedUser));

        // Act
        boolean result = authService.registerUser(testUser);

        // Assert
        assertFalse(result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUserSuccess() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        // Act
        boolean result = authService.authenticateUser(testUser);

        // Assert
        assertTrue(result);
        verify(passwordEncoder).matches("password123", "encodedPassword");
    }

    @Test
    void authenticateUserFailureWrongPassword() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);
        
        // Create user with wrong password
        User userWithWrongPassword = new User("testuser", "wrongpassword", "USER");

        // Act
        boolean result = authService.authenticateUser(userWithWrongPassword);

        // Assert
        assertFalse(result);
        verify(passwordEncoder).matches("wrongpassword", "encodedPassword");
    }

    @Test
    void authenticateUserFailureUserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistentuser")).thenReturn(Optional.empty());
        
        // Create non-existent user
        User nonExistentUser = new User("nonexistentuser", "password123", "USER");

        // Act & Assert
        Exception exception = assertThrows(
            RuntimeException.class,
            () -> authService.authenticateUser(nonExistentUser)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
}
