package com.Sticky_notes.Sticky_notes.integration;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up before each test
        userRepository.deleteAll();
        
        // Create a test user with encoded password
        String encodedPassword = passwordEncoder.encode("password123");
        testUser = new User("integrationtestuser", encodedPassword, "USER");
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        userRepository.deleteAll();
    }

    @Test
    void registrationAndLoginFlow() throws Exception {
        // Registration test
        mockMvc.perform(post("/api/registration/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk());

        // Login test with correct credentials
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk())
                .andExpect(content().string("Login successful"));

        // Login test with incorrect password
        User userWithWrongPassword = new User("integrationtestuser", "wrongpassword", "USER");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userWithWrongPassword)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password"));

        // Login test with non-existent user
        User nonExistentUser = new User("nonexistentuser", "password123", "USER");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nonExistentUser)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password"));
    }

    @Test
    void registrationWithExistingUsername() throws Exception {
        // First registration should succeed
        mockMvc.perform(post("/api/registration/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk());

        // Second registration with the same username should fail
        mockMvc.perform(post("/api/registration/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Username already taken"));
    }
}
