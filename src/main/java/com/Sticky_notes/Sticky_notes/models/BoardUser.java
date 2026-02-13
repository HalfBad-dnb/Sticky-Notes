package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class BoardUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username; // Username of the assigned user
    private String role; // Role: "viewer", "editor", "admin"
    private LocalDateTime assignedAt; // When user was assigned

    @ManyToOne
    @JoinColumn(name = "board_id")
    private Board board; // The board this user belongs to

    // Constructors
    public BoardUser() {
        this.assignedAt = LocalDateTime.now();
        this.role = "viewer"; // Default role
    }
    
    public BoardUser(String username, String role, Board board) {
        this();
        this.username = username;
        this.role = role;
        this.board = board;
    }

    // Getters and Setters
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Board getBoard() {
        return board;
    }

    public void setBoard(Board board) {
        this.board = board;
    }
}
