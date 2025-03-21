package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("repositorytestuser", "password123", "USER");
        userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    void findByUsername() {
        // Act
        Optional<User> foundUser = userRepository.findByUsername("repositorytestuser");

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals("repositorytestuser", foundUser.get().getUsername());
    }

    @Test
    void findByUsernameNotFound() {
        // Act
        Optional<User> foundUser = userRepository.findByUsername("nonexistentuser");

        // Assert
        assertFalse(foundUser.isPresent());
    }

    @Test
    void existsByUsername() {
        // Act
        boolean exists = userRepository.existsByUsername("repositorytestuser");

        // Assert
        assertTrue(exists);
    }

    @Test
    void existsByUsernameNotFound() {
        // Act
        boolean exists = userRepository.existsByUsername("nonexistentuser");

        // Assert
        assertFalse(exists);
    }

    @Test
    void saveUser() {
        // Arrange
        User newUser = new User("newuser", "newpassword", "USER");

        // Act
        User savedUser = userRepository.save(newUser);

        // Assert
        assertNotNull(savedUser.getId());
        assertEquals("newuser", savedUser.getUsername());
        assertEquals("newpassword", savedUser.getPassword());
        assertEquals("USER", savedUser.getRoles());
    }

    @Test
    void deleteUser() {
        // Act
        userRepository.delete(testUser);
        boolean exists = userRepository.existsByUsername("repositorytestuser");

        // Assert
        assertFalse(exists);
    }
}
