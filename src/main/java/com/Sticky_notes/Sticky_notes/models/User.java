package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;
import com.Sticky_notes.Sticky_notes.models.Board;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String email;
    private String password;
    
    // Assuming a single role as a String. If multiple roles are needed, this should be a collection.
    private String role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Board> boards = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    // Default constructor (required by JPA)
    public User() {}

    // Constructor for convenience
    public User(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;  // Added role in the constructor
    }
    
    // Backward-compatible constructor for tests
    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.email = username + "@example.com"; // Default email for backward compatibility
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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
    
    public List<RefreshToken> getRefreshTokens() {
        return refreshTokens;
    }
    
    public void setRefreshTokens(List<RefreshToken> refreshTokens) {
        this.refreshTokens = refreshTokens;
    }
    
    public void addRefreshToken(RefreshToken refreshToken) {
        refreshTokens.add(refreshToken);
        refreshToken.setUser(this);
    }
    
    public void removeRefreshToken(RefreshToken refreshToken) {
        refreshTokens.remove(refreshToken);
        refreshToken.setUser(null);
    }
}
