package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;

@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Register a new user
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        // Check if the username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
        }

        // Encode the password before saving the user
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // Save the user to the database
        return userRepository.save(user);
    }

    // Optionally, you can add a check if a username is already taken
    @GetMapping("/check-username/{username}")
    public boolean checkUsernameAvailability(@PathVariable String username) {
        return !userRepository.existsByUsername(username);
    }
}
