package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by username (this will be used for login or authentication)
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    // Optionally, you could add more custom queries here as needed
}
