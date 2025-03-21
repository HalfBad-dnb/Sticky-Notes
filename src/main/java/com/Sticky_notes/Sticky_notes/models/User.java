package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    
    // Assuming a single role as a String. If multiple roles are needed, this should be a collection.
    private String role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Board> boards;

    // Default constructor (required by JPA)
    public User() {}

    // Constructor for convenience
    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;  // Added role in the constructor
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Role getters and setters
    public String getRoles() {
        return role;
    }

    public void setRoles(String role) {
        this.role = role;  // Setter for role
    }

    public List<Board> getBoards() {
        return boards;
    }

    public void setBoards(List<Board> boards) {
        this.boards = boards;
    }
}
