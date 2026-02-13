package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.Board;
import com.Sticky_notes.Sticky_notes.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
   
    // Legacy methods
    Optional<Board> findByCode(String code);
    List<Board> findByUser(User user);
    
    // New board management methods
    List<Board> findByCreatedBy(String createdBy);
    List<Board> findByIsPublicTrue();
    Optional<Board> findByNameAndCreatedBy(String name, String createdBy);
    
    // Find all boards accessible to a user (created by them or public)
    @Query("SELECT b FROM Board b WHERE b.createdBy = :username OR b.isPublic = true ORDER BY b.createdAt DESC")
    List<Board> findAccessibleBoards(@Param("username") String username);
    
    // Count boards by creator
    @Query("SELECT COUNT(b) FROM Board b WHERE b.createdBy = :username")
    Long countByCreatedBy(@Param("username") String username);
}
