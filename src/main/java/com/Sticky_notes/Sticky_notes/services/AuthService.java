package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.User;

public interface AuthService {
    boolean registerUser(User user);
    boolean authenticateUser(User user);
    User getUserByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
