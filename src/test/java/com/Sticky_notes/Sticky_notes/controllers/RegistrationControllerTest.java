package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.Register;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;



import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class RegistrationControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private RegistrationController registrationController;

    private Register testRegister;
    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        testRegister = new Register();
        testRegister.setUsername("testuser");
        testRegister.setEmail("testuser@example.com");
        testRegister.setPassword("password123");
        testRegister.setConfirmPassword("password123");
        
        testUser = new User("testuser", "testuser@example.com", "encodedPassword", "USER");
        
        // Mock password encoder to return a fixed encoded password
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
    }

    @Test
    void registerUserSuccess() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = registrationController.registerUser(testRegister);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("User registered successfully", response.getBody());
        // Verify that the password was encoded
        verify(passwordEncoder).encode("password123");
        // Verify that the user was saved
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUserFailureUsernameExists() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act
        ResponseEntity<?> response = registrationController.registerUser(testRegister);
        
        // Assert
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Username already taken", response.getBody());
        // Verify that the user was not saved
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void checkUsernameAvailabilityAvailable() {
        // Arrange
        when(userRepository.existsByUsername("newuser")).thenReturn(false);

        // Act
        boolean result = registrationController.checkUsernameAvailability("newuser");

        // Assert
        assertTrue(result);
    }

    @Test
    void checkUsernameAvailabilityNotAvailable() {
        // Arrange
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // Act
        boolean result = registrationController.checkUsernameAvailability("existinguser");

        // Assert
        assertFalse(result);
    }
}
