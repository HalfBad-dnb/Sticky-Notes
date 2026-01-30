package com.Sticky_notes.Sticky_notes.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscription_tiers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionTier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false)
    private String stripePriceId;
    
    @Column(nullable = false)
    private Integer price;
    
    @Column(nullable = false)
    private String currency;
    
    @Column(nullable = false)
    private String interval;
    
    @Column(columnDefinition = "TEXT")
    private String features;
    
    @Column(nullable = false)
    private Integer maxNotes;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Column(nullable = false)
    private Integer sortOrder;
}
