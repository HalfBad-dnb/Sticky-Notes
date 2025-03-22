package com.Sticky_notes.Sticky_notes.models;

/**
 * Profile model class to represent user profile data
 */
public class Profile {
    private String username;
    private String email;
    private String role;
    private long notesCount;
    
    // Default constructor
    public Profile() {
    }
    
    // Constructor with all fields
    public Profile(String username, String email, String role, long notesCount) {
        this.username = username;
        this.email = email;
        this.role = role;
        this.notesCount = notesCount;
    }
    
    // Getters and setters
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
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public long getNotesCount() {
        return notesCount;
    }
    
    public void setNotesCount(long notesCount) {
        this.notesCount = notesCount;
    }
}
