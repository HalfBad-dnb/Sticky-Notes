package com.Sticky_notes.Sticky_notes.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;

import com.Sticky_notes.Sticky_notes.security.CustomUserDetailsService;

import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for non-browser clients (like mobile or API)
            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/api/auth/**").permitAll() // Allow authentication routes without authentication
                    .requestMatchers("/api/comments/**").permitAll() // Allow comments endpoint without authentication
                    .anyRequest().authenticated() // Require authentication for all other requests
            )
            .httpBasic(Customizer.withDefaults()) // Use HTTP Basic authentication
            .formLogin(Customizer.withDefaults()); // Use default form login configuration

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Password encoding using BCrypt
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new CustomUserDetailsService(); // Custom UserDetailsService for user authentication
    }
}
