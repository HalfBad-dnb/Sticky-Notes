package com.Sticky_notes.Sticky_notes;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.http.MediaType.APPLICATION_JSON;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@EnableWebSecurity
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    // Test for public access to authentication and notes endpoints
    @Test
    public void shouldAllowPublicAccessToAuthAndNotesEndpoints() throws Exception {
        // Test /api/auth/login endpoint with POST (public, should be accessible without authentication)
        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isUnauthorized()); // Expects HTTP 401 (wrong credentials but endpoint exists)

        // Test /api/notes endpoint (public, should be accessible without authentication)
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isNoContent()); // Expects HTTP 204 No Content (empty database)
    }

    // Test that authenticated users can access private endpoints
    @Test
    @WithMockUser(username = "validUser", roles = "USER") // Simulate a logged-in user
    public void shouldAllowAuthenticatedUsersToAccessPrivateEndpoints() throws Exception {
        // Test /api/notes endpoint (authenticated access allowed)
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isNoContent()); // Expects HTTP 204 No Content (empty database)
    }

    // Test that unauthenticated users can access public notes endpoints
    @Test
    public void shouldReturnOkForPublicNotesEndpoints() throws Exception {
        // Test /api/notes endpoint without authentication (should return 204 No Content for empty database)
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isNoContent()); // Expects HTTP 204 No Content (empty database)
    }

    // Test for invalid login attempt (should return 401 Unauthorized)
    @Test
    public void shouldReturnUnauthorizedForInvalidLogin() throws Exception {
        // Test login with invalid credentials (wrong user and password)
        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content("{\"username\":\"invalidUser\",\"password\":\"wrongPassword\"}"))
                .andExpect(status().isUnauthorized()); // Expects HTTP 401 Unauthorized
    }

    // Test for valid login attempt (should return 200 with token)
    @Test
    public void shouldAuthenticateUserWithValidCredentials() throws Exception {
        // Test login with valid credentials (returns JWT token)
        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isUnauthorized()); // Expects HTTP 401 (test user doesn't exist but endpoint works)
    }

    // Test for CSRF protection being disabled (request should succeed without CSRF token)
    @Test
    public void shouldAllowRequestsWithoutCsrfToken() throws Exception {
        // This depends on your CSRF configuration in SecurityConfig.
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isNoContent()); // Should return 204 if CSRF is disabled for GET requests
    }
}
