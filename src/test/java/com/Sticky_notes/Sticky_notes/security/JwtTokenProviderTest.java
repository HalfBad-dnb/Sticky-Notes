package com.Sticky_notes.Sticky_notes.security;

import com.Sticky_notes.Sticky_notes.Config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @Mock
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(jwtProperties.getJwtSecret()).thenReturn("testSecretKey123456789012345678901234567890");
        when(jwtProperties.getJwtExpirationMs()).thenReturn(3600000L); // 1 hour
        when(jwtProperties.getJwtRefreshExpirationMs()).thenReturn(86400000L); // 24 hours
        
        tokenProvider = new JwtTokenProvider(jwtProperties);
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        // Arrange
        UserDetails userDetails = new User("testuser", "password", 
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());

        // Act
        String token = tokenProvider.generateToken(authentication);

        // Assert
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("testuser", tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateTokenFromUsername_ShouldReturnValidToken() {
        // Act
        String token = tokenProvider.generateTokenFromUsername("testuser");

        // Assert
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("testuser", tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateRefreshToken_ShouldReturnValidRefreshToken() {
        // Act
        String refreshToken = tokenProvider.generateRefreshToken("testuser");

        // Assert
        assertNotNull(refreshToken);
        assertTrue(tokenProvider.validateToken(refreshToken));
        assertEquals("testuser", tokenProvider.getUsernameFromToken(refreshToken));
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        // Arrange
        String invalidToken = "invalid.token.here";

        // Act & Assert
        assertFalse(tokenProvider.validateToken(invalidToken));
    }

    @Test
    void validateToken_WithExpiredToken_ShouldReturnFalse() {
        // Arrange
        when(jwtProperties.getJwtExpirationMs()).thenReturn(-1000L); // Expired token
        String token = tokenProvider.generateTokenFromUsername("testuser");

        // Act & Assert
        assertFalse(tokenProvider.validateToken(token));
    }

    @Test
    void getUsernameFromToken_WithValidToken_ShouldReturnUsername() {
        // Arrange
        String username = "testuser";
        String token = tokenProvider.generateTokenFromUsername(username);

        // Act
        String extractedUsername = tokenProvider.getUsernameFromToken(token);

        // Assert
        assertEquals(username, extractedUsername);
    }
}
