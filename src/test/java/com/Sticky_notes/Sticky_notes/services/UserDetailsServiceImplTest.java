package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User("testuser", "encodedPassword", "USER");
    }

    @Test
    void loadUserByUsernameSuccess() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        // Assert
        assertNotNull(userDetails);
        assertEquals("testuser", userDetails.getUsername());
        assertEquals("encodedPassword", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    void loadUserByUsernameWithMultipleRoles() {
        // Arrange
        User userWithMultipleRoles = new User("adminuser", "encodedPassword", "USER,ADMIN");
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(userWithMultipleRoles));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername("adminuser");

        // Assert
        assertNotNull(userDetails);
        assertEquals("adminuser", userDetails.getUsername());
        assertEquals("encodedPassword", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER")));
        assertTrue(userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    @Test
    void loadUserByUsernameUserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistentuser")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(
            UsernameNotFoundException.class,
            () -> userDetailsService.loadUserByUsername("nonexistentuser")
        );
        
        assertEquals("User not found", exception.getMessage());
    }
}
