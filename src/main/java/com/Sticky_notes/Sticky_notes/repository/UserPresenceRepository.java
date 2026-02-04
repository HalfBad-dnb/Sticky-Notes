package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
    
    Optional<UserPresence> findByUserId(Long userId);
    
    Optional<UserPresence> findBySessionId(String sessionId);
    
    @Query("SELECT up FROM UserPresence up WHERE up.isOnline = true ORDER BY up.lastSeen DESC")
    List<UserPresence> findOnlineUsersOrderByLastSeen();
    
    @Query("SELECT COUNT(up) FROM UserPresence up WHERE up.isOnline = true")
    long countOnlineUsers();
    
    @Query("SELECT up FROM UserPresence up WHERE up.isOnline = true AND up.lastSeen < :cutoffTime")
    List<UserPresence> findStaleSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
}
