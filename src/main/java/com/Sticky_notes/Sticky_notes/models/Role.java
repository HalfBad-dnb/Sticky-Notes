package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;


@Entity
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;  // For example: "ROLE_USER", "ROLE_ADMIN"

    // Constructors, getters, and setters
    public Role() {}

    public Role(String name) {
        this.name = name;
    }

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
}
