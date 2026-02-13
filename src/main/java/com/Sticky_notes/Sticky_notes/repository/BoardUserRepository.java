package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.BoardUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardUserRepository extends JpaRepository<BoardUser, Long> {
    
    // Find board users by username
    List<BoardUser> findByUsername(String username);
    
    // Find board users by board
    List<BoardUser> findByBoardId(Long boardId);
    
    // Find specific board user assignment
    Optional<BoardUser> findByUsernameAndBoardId(String username, Long boardId);
    
    // Find all users for a specific board
    @Query("SELECT bu FROM BoardUser bu WHERE bu.board.id = :boardId")
    List<BoardUser> findAllUsersForBoard(@Param("boardId") Long boardId);
    
    // Find all boards for a specific user
    @Query("SELECT bu.board FROM BoardUser bu WHERE bu.username = :username")
    List<com.Sticky_notes.Sticky_notes.models.Board> findBoardsForUser(@Param("username") String username);
    
    // Count users on a board
    @Query("SELECT COUNT(bu) FROM BoardUser bu WHERE bu.board.id = :boardId")
    Long countUsersOnBoard(@Param("boardId") Long boardId);
    
    // Delete board user assignment
    void deleteByUsernameAndBoardId(String username, Long boardId);
}
