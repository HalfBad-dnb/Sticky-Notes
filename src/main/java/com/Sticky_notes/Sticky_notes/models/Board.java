package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;

@Entity
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code; // Unique code for the board
    private String content; // Board content
    private String title;

    @ManyToOne
    @JoinColumn(name = "user_id") // This will join the "user_id" column with the User table
    private User user; // This represents the owner of the board

    // Getters and Setters
    public String getTitle() {

        return title;
    }

    public void setTitle(String title) {

        this.title = title;

    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        this.user = user;  // Setter method to link a User to this Board
    }
}
