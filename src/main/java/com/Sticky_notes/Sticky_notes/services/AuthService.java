package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;  // Injecting PasswordEncoder

    // Register a new user (with password hashing)
    public boolean registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return false;  // Username already exists
        }

        // Hash the password before saving the user
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Use injected passwordEncoder
        userRepository.save(user);
        return true;
    }

    // Authenticate a user (check username and password)
    public boolean authenticateUser(User user) {
        User foundUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if password matches
        return passwordEncoder.matches(user.getPassword(), foundUser.getPassword());  // Use injected passwordEncoder
    }
    
    // Get user by username
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
