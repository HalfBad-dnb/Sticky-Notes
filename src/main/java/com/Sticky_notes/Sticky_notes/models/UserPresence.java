package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_presence")
public class UserPresence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "is_online", nullable = false)
    private Boolean isOnline = false;
    
    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
    
    @Column(name = "session_id", unique = true)
    private String sessionId;
    
    public UserPresence() {
        this.lastSeen = LocalDateTime.now();
    }
    
    public UserPresence(User user) {
        this();
        this.user = user;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
        if (isOnline) {
            this.lastSeen = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
