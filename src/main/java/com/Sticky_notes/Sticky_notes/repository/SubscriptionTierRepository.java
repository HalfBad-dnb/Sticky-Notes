package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.SubscriptionTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionTierRepository extends JpaRepository<SubscriptionTier, Long> {
    
    // Find subscription tier by name
    Optional<SubscriptionTier> findByName(String name);
    
    // Find all active subscription tiers
    @Query("SELECT st FROM SubscriptionTier st WHERE st.isActive = true")
    List<SubscriptionTier> findActiveTiers();
    
    // Find subscription tier by price
    List<SubscriptionTier> findByPrice(Double price);
    
    // Find subscription tier by features
    @Query("SELECT st FROM SubscriptionTier st WHERE st.features LIKE %:feature%")
    List<SubscriptionTier> findByFeatureContaining(@Param("feature") String feature);
    
    // Check if subscription tier name exists
    boolean existsByName(String name);
}
