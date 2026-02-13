package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name; // Board name (e.g., "profile", "profile2")
    private String description; // Board description
    private boolean isPublic; // Public or private board
    private String createdBy; // Username of creator
    private LocalDateTime createdAt; // Creation timestamp
    
    // Legacy fields for compatibility
    @Column(name = "code")
    private String code; // Unique code for the board
    
    @Column(name = "content")
    private String content; // Board content
    
    @Column(name = "title")
    private String title; // Legacy title field
    
    @Column(name = "board_type")
    private String boardType; // Type of the board

    @ManyToOne
    @JoinColumn(name = "user_id") // This will join the "user_id" column with the User table
    @JsonIgnore
    private User user; // This represents the owner of the board
    
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<BoardUser> boardUsers; // Users assigned to this board
    
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Note> notes; // Notes on this board

    // Constructors
    public Board() {
        this.createdAt = LocalDateTime.now();
        this.isPublic = false;
        this.boardType = "GENERAL"; // Default board type
        this.content = ""; // Default empty content
    }
    
    public Board(String name, String description, boolean isPublic, String createdBy) {
        this();
        this.name = name;
        this.description = description;
        this.isPublic = isPublic;
        this.createdBy = createdBy;
        this.title = name; // Set title to name by default
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<BoardUser> getBoardUsers() {
        return boardUsers;
    }

    public void setBoardUsers(List<BoardUser> boardUsers) {
        this.boardUsers = boardUsers;
    }

    // Legacy getters/setters for compatibility
    public String getTitle() {
        return title != null ? title : name;
    }

    public void setTitle(String title) {
        this.title = title;
        if (this.name == null) {
            this.name = title;
        }
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
    
    public String getBoardType() {
        return boardType;
    }
    
    public void setBoardType(String boardType) {
        this.boardType = boardType;
    }
    
    public List<Note> getNotes() {
        return notes;
    }
    
    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }
}
