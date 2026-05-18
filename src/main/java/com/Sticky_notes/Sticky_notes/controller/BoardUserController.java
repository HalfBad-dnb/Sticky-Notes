package com.Sticky_notes.Sticky_notes.controller;

import com.Sticky_notes.Sticky_notes.models.Board;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.BoardRepository;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import com.Sticky_notes.Sticky_notes.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/boards/{boardId}/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BoardUserController {

    @Autowired
    private BoardRepository boardRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Get all users assigned to a board
    @GetMapping
    public ResponseEntity<?> getBoardUsers(@PathVariable Long boardId,
                                          @RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            
            Optional<Board> boardOptional = boardRepository.findById(boardId);
            if (!boardOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Board not found");
            }
            
            Board board = boardOptional.get();
            
            // Check if user has access
            if (!board.getCreatedBy().equals(username) && !board.isPublic()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            // Mock response for now (since BoardUser relationship isn't fully implemented)
            List<Map<String, Object>> users = List.of(
                Map.of("username", board.getCreatedBy(), "role", "admin")
            );
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    // Assign a user to a board
    @PostMapping("/assign")
    public ResponseEntity<?> assignUserToBoard(@PathVariable Long boardId,
                                             @RequestBody Map<String, Object> assignmentData,
                                             @RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            
            Optional<Board> boardOptional = boardRepository.findById(boardId);
            if (!boardOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Board not found");
            }
            
            Board board = boardOptional.get();
            
            // Only board creator can assign users
            if (!board.getCreatedBy().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only board creator can assign users");
            }
            
            String targetUsername = (String) assignmentData.get("username");
            String role = (String) assignmentData.getOrDefault("role", "viewer");
            
            // Check if target user exists
            Optional<User> targetUserOptional = userRepository.findByUsername(targetUsername);
            if (!targetUserOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found: " + targetUsername);
            }
            
            // Mock assignment (in real implementation, would save BoardUser entity)
            Map<String, Object> response = new HashMap<>();
            response.put("username", targetUsername);
            response.put("role", role);
            response.put("boardId", boardId);
            response.put("assigned", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error assigning user");
        }
    }

    // Remove a user from a board
    @PostMapping("/unassign")
    public ResponseEntity<?> removeUserFromBoard(@PathVariable Long boardId,
                                               @RequestBody Map<String, Object> removalData,
                                               @RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            
            Optional<Board> boardOptional = boardRepository.findById(boardId);
            if (!boardOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Board not found");
            }
            
            Board board = boardOptional.get();
            
            // Only board creator can remove users (or user can remove themselves)
            String targetUsername = (String) removalData.get("username");
            if (!board.getCreatedBy().equals(username) && !username.equals(targetUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            // Mock removal (in real implementation, would delete BoardUser entity)
            Map<String, Object> response = new HashMap<>();
            response.put("username", targetUsername);
            response.put("boardId", boardId);
            response.put("removed", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error removing user");
        }
    }

    // Leave a board
    @PostMapping("/leave")
    public ResponseEntity<?> leaveBoard(@PathVariable Long boardId,
                                      @RequestBody Map<String, Object> leaveData,
                                      @RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            
            Optional<Board> boardOptional = boardRepository.findById(boardId);
            if (!boardOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Board not found");
            }
            
            Board board = boardOptional.get();
            
            // Board creator cannot leave their own board
            if (board.getCreatedBy().equals(username)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Board creator cannot leave their own board");
            }
            
            // Mock leaving (in real implementation, would delete BoardUser entity)
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("boardId", boardId);
            response.put("left", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error leaving board");
        }
    }
}
