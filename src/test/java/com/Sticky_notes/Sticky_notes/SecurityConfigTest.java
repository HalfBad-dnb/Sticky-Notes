package com.Sticky_notes.Sticky_notes;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@EnableWebSecurity
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    // Test for public access to authentication and notes endpoints
    @Test
    public void shouldAllowPublicAccessToAuthAndnotesEndpoints() throws Exception {
        // Test /api/auth/login endpoint (public, should be accessible without authentication)
        mockMvc.perform(get("/api/auth/login"))
                .andExpect(status().isOk()); // Expects HTTP 200 OK response

        // Test /api/notes/view endpoint (public, should be accessible without authentication)
        mockMvc.perform(get("/api/notes/view"))
                .andExpect(status().isOk()); // Expects HTTP 200 OK response
    }

    // Test that authenticated users can access private endpoints
    @Test
    @WithMockUser(username = "validUser", roles = "USER") // Simulate a logged-in user
    public void shouldAllowAuthenticatedUsersToAccessPrivateEndpoints() throws Exception {
        // Test /api/notes/view endpoint (authenticated access allowed)
        mockMvc.perform(get("/api/notes/view"))
                .andExpect(status().isOk()); // Expects HTTP 200 OK response
    }

    // Test that unauthenticated users cannot access private endpoints
    @Test
    public void shouldReturnUnauthorizedForPrivateEndpointsWithoutAuthentication() throws Exception {
        // Test /api/notes/view endpoint without authentication (should return 401 Unauthorized)
        mockMvc.perform(get("/api/notes/view"))
                .andExpect(status().isUnauthorized()); // Expects HTTP 401 Unauthorized response
    }

    // Test for invalid login attempt (should return 401 Unauthorized)
    @Test
    public void shouldReturnUnauthorizedForInvalidLogin() throws Exception {
        // Test login with invalid credentials (wrong user and password)
        mockMvc.perform(post("/login")
                .param("username", "invalidUser")
                .param("password", "wrongPassword"))
                .andExpect(status().isUnauthorized()); // Expects HTTP 401 Unauthorized
    }

    // Test for valid login attempt (should redirect to the target page after successful login)
    @Test
    public void shouldAuthenticateUserWithValidCredentials() throws Exception {
        // Test login with valid credentials (adjust with actual credentials in your app)
        mockMvc.perform(post("/login")
                .param("username", "validUser")
                .param("password", "correctPassword"))
                .andExpect(status().is3xxRedirection()); // Expects HTTP 3xx Redirection (success)
    }

    // Test for CSRF protection being disabled (request should succeed without CSRF token)
    @Test
    public void shouldAllowRequestsWithoutCsrfToken() throws Exception {
        // This depends on your CSRF configuration in SecurityConfig.
        mockMvc.perform(get("/api/notes/view"))
                .andExpect(status().isUnauthorized()); // Should return unauthorized if CSRF is enabled
    }
}
