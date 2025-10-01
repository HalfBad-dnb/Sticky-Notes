package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for note entity, providing CRUD operations and custom queries.
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // Optional: Custom query to find notes containing specific text (case-insensitive)
    List<Note> findByTextContainingIgnoreCase(String text);
    
    // Find notes by username and board type
    List<Note> findByUsernameAndBoardType(String username, String boardType);
    
    // Find private notes by username
    List<Note> findByUsernameAndIsPrivateTrue(String username);
    
    // Find notes by username (keeping for backward compatibility)
    List<Note> findByUsername(String username);
    
    // Find public notes by username
    List<Note> findByUsernameAndIsPrivateFalse(String username);
    
    // Find all public notes
    List<Note> findByIsPrivateFalse();
    
    // Find public notes by board type
    List<Note> findByIsPrivateFalseAndBoardType(String boardType);
    
    // Find notes by username, privacy status, and board type
    List<Note> findByUsernameAndIsPrivateFalseAndBoardType(String username, String boardType);
    
    // Find private notes by username and board type
    List<Note> findByUsernameAndIsPrivateTrueAndBoardType(String username, String boardType);
    
    // Count notes by username
    long countByUsername(String username);
    
    // Count private notes by username
    long countByUsernameAndIsPrivateTrue(String username);
    
    // Count public notes by username
    long countByUsernameAndIsPrivateFalse(String username);
    
    // Find done notes by username and board type
    List<Note> findByUsernameAndDoneTrueAndBoardType(String username, String boardType);
    
    // Find non-done notes by username and board type
    List<Note> findByUsernameAndDoneFalseAndBoardType(String username, String boardType);
}
