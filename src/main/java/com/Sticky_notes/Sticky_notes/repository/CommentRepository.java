package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Comment entity, providing CRUD operations and custom queries.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Optional: Custom query to find comments containing specific text (case-insensitive)
    List<Comment> findByTextContainingIgnoreCase(String text);
    
    // Find comments by username and board type
    List<Comment> findByUsernameAndBoardType(String username, String boardType);
    
    // Find private comments by username
    List<Comment> findByUsernameAndIsPrivateTrue(String username);
    
    // Find comments by username (keeping for backward compatibility)
    List<Comment> findByUsername(String username);
    
    // Find public comments by username
    List<Comment> findByUsernameAndIsPrivateFalse(String username);
    
    // Find all public comments
    List<Comment> findByIsPrivateFalse();
    
    // Find public comments by board type
    List<Comment> findByIsPrivateFalseAndBoardType(String boardType);
    
    // Find comments by username, privacy status, and board type
    List<Comment> findByUsernameAndIsPrivateFalseAndBoardType(String username, String boardType);
    
    // Find private comments by username and board type
    List<Comment> findByUsernameAndIsPrivateTrueAndBoardType(String username, String boardType);
    
    // Count comments by username
    long countByUsername(String username);
    
    // Count private comments by username
    long countByUsernameAndIsPrivateTrue(String username);
    
    // Count public comments by username
    long countByUsernameAndIsPrivateFalse(String username);
    
    // Find done notes by username and board type
    List<Comment> findByUsernameAndDoneTrueAndBoardType(String username, String boardType);
    
    // Find non-done notes by username and board type
    List<Comment> findByUsernameAndDoneFalseAndBoardType(String username, String boardType);
}