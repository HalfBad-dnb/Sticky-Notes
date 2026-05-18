package com.Sticky_notes.Sticky_notes.controller;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import com.Sticky_notes.Sticky_notes.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Get all users (for board assignment)
    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            
            List<User> users = userRepository.findAll();
            
            // Convert to response format (excluding current user)
            List<Map<String, Object>> response = users.stream()
                .filter(user -> !user.getUsername().equals(username))
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    return userMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    // Get boards for a specific user
    @GetMapping("/{username}/boards")
    public ResponseEntity<?> getUserBoards(@PathVariable String username,
                                          @RequestHeader("Authorization") String token) {
        try {
            String requestUsername = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            
            // Only allow users to see their own boards
            if (!username.equals(requestUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Map<String, Object>> response = user.getBoards().stream()
                .map(board -> {
                    Map<String, Object> boardMap = new HashMap<>();
                    boardMap.put("id", board.getId());
                    boardMap.put("name", board.getName());
                    boardMap.put("description", board.getDescription());
                    boardMap.put("isPublic", board.isPublic());
                    boardMap.put("createdAt", board.getCreatedAt());
                    return boardMap;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching user boards");
        }
    }
}
