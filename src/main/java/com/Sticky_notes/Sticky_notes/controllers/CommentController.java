package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.Comment;
import com.Sticky_notes.Sticky_notes.repository.CommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import jakarta.validation.Valid;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);

    private final CommentRepository commentRepository;

    // List of connected SSE clients
    private final CopyOnWriteArrayList<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public CommentController(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // SSE stream to send updates to connected clients
    @GetMapping(value = "/sse", produces = "text/event-stream")
    public SseEmitter streamComments() {
        SseEmitter emitter = new SseEmitter();
        clients.add(emitter);

        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> clients.remove(emitter));

        return emitter;
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments(@RequestParam(required = false) String username) {
        try {
            List<Comment> comments;
            
            if (username != null && !username.isEmpty()) {
                // Get user's public comments for the main board
                comments = commentRepository.findByUsernameAndIsPrivateFalseAndBoardType(username, "main");
            } else {
                // Get all public comments for the main board (for guests)
                comments = commentRepository.findByIsPrivateFalseAndBoardType("main");
            }
            
            // Sort by creation time (most recent first)
            List<Comment> sortedComments = comments.stream()
                .sorted(Comparator.comparing(Comment::getId).reversed())
                .collect(java.util.stream.Collectors.toList());
            
            if (sortedComments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(sortedComments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/profile/{username}")
    public ResponseEntity<List<Comment>> getUserProfileComments(
            @PathVariable String username,
            @RequestParam(required = false) Boolean isPrivate) {
        try {
            List<Comment> profileComments;
            
            // If isPrivate parameter is provided, filter by privacy status
            if (isPrivate != null) {
                if (isPrivate) {
                    // Get only private profile notes
                    profileComments = commentRepository.findByUsernameAndIsPrivateTrueAndBoardType(username, "profile");
                } else {
                    // Get only public profile notes
                    profileComments = commentRepository.findByUsernameAndIsPrivateFalseAndBoardType(username, "profile");
                }
            } else {
                // Get all profile notes (both public and private)
                profileComments = commentRepository.findByUsernameAndBoardType(username, "profile");
            }
            
            // Sort by creation time (newest first)
            profileComments.sort(Comparator.comparing(Comment::getId).reversed());
            
            logger.debug("Found {} profile comments for user: {} (isPrivate={})", 
                profileComments.size(), username, isPrivate);
            
            if (profileComments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(profileComments, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving profile comments for user {}: {}", username, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Comment>> getCommentsByUsername(@PathVariable String username) {
        try {
            // Get only profile board comments for this user
            List<Comment> profileComments = commentRepository.findByUsernameAndBoardType(username, "profile");
            
            logger.debug("Found {} profile comments for user: {}", profileComments.size(), username);
            
            // Log all profile comments for debugging
            for (Comment comment : profileComments) {
                logger.trace("Profile Comment - ID: {}, Text: {}, BoardType: {}, IsPrivate: {}", 
                    comment.getId(), comment.getText(), comment.getBoardType(), comment.getIsPrivate());
            }
                
            if (profileComments.isEmpty()) {
                logger.info("No profile comments found for user: {}", username);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            logger.debug("Returning {} profile comments with HTTP 200 OK", profileComments.size());
            return new ResponseEntity<>(profileComments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}/private")
    public ResponseEntity<List<Comment>> getPrivateCommentsByUsername(@PathVariable String username) {
        try {
            // Get only private comments for this user
            List<Comment> privateComments = commentRepository.findByUsernameAndIsPrivateTrue(username);
            
            logger.debug("Found {} private comments for user: {}", privateComments.size(), username);
            
            // For backward compatibility, if there are no private notes with boardType="profile",
            // return all private notes for this user
            boolean hasPrivateProfileNotes = privateComments.stream()
                .anyMatch(comment -> "profile".equals(comment.getBoardType()));
                
            List<Comment> privateProfileComments;
            if (hasPrivateProfileNotes) {
                // If there are private profile notes, filter to include only those
                privateProfileComments = privateComments.stream()
                    .filter(comment -> "profile".equals(comment.getBoardType()))
                    .collect(java.util.stream.Collectors.toList());
            } else {
                // For backward compatibility, if no private profile notes exist, return all private notes
                privateProfileComments = privateComments;
            }
                
            if (privateProfileComments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(privateProfileComments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}/public")
    public ResponseEntity<List<Comment>> getPublicCommentsByUsername(@PathVariable String username) {
        try {
            // Get only public comments for this user
            List<Comment> comments = commentRepository.findByUsernameAndIsPrivateFalse(username);
            if (comments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(@Valid @RequestBody Comment comment) {
        try {
            // Initialize done to false if null
            comment.setDone(comment.isDone());
            
            // Ensure boardType is set
            if (comment.getBoardType() == null) {
                comment.setBoardType("main"); // Default to main board if not specified
            }
            
            // Validate that boardType is either "main" or "profile"
            if (!"main".equals(comment.getBoardType()) && !"profile".equals(comment.getBoardType())) {
                comment.setBoardType("main"); // Default to main if invalid value
            }
            
            // Ensure isPrivate is set
            if (comment.getIsPrivate() == null) {
                comment.setIsPrivate(false);
            }
            
            logger.debug("Creating comment with boardType: {}, isPrivate: {}", 
                comment.getBoardType(), comment.getIsPrivate());
            
            Comment savedComment = commentRepository.save(comment);
            sendUpdateToClients(savedComment); // Notify clients about the new comment
            return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating comment: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateCommentPosition(@PathVariable Long id, @RequestBody Comment updatedPosition) {
        try {
            Optional<Comment> existingCommentOpt = commentRepository.findById(id);
            if (existingCommentOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Comment comment = existingCommentOpt.get();
            comment.setX(updatedPosition.getX());
            comment.setY(updatedPosition.getY());
            Comment savedComment = commentRepository.save(comment);
            return new ResponseEntity<>(savedComment, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/done")
    public ResponseEntity<Comment> markAsDone(@PathVariable Long id) {
        try {
            Optional<Comment> commentOpt = commentRepository.findById(id);
            if (commentOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Comment comment = commentOpt.get();
            comment.setDone(true);
            Comment savedComment = commentRepository.save(comment);
            // Notify clients about the updated comment
            sendUpdateToClients(savedComment);
            return new ResponseEntity<>(savedComment, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        try {
            if (!commentRepository.existsById(id)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            commentRepository.deleteById(id);
            // Notify clients about the deleted comment
            sendDeleteUpdateToClients(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Send comment updates to all connected clients
    private void sendUpdateToClients(Comment comment) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(comment);
            } catch (IOException e) {
                emitter.completeWithError(e);
                clients.remove(emitter);
            }
        }
    }

    /**
     * Get notes by status (done/deleted) and board type
     * @param status The status of the notes to fetch ("done" or "deleted")
     * @param boardType The type of board ("main" or "profile")
     * @param authentication The authentication object containing the current user
     * @return List of comments matching the criteria
     */
    @GetMapping("/by-status")
    public ResponseEntity<List<Comment>> getNotesByStatus(
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "profile") String boardType,
            Authentication authentication) {
        
        if (authentication == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        String username = authentication.getName();
        List<Comment> notes;
        
        try {
            if ("done".equalsIgnoreCase(status) || "deleted".equalsIgnoreCase(status)) {
                // For both done and deleted, we use the same query since deleted is marked by done=true
                notes = commentRepository.findByUsernameAndDoneTrueAndBoardType(username, boardType);
                
                // If we need to distinguish between done and deleted in the future, we can add a deleted flag to the Comment model
                // and update the query accordingly
            } else {
                // For active notes (not done/deleted)
                notes = commentRepository.findByUsernameAndDoneFalseAndBoardType(username, boardType);
            }
            
            if (notes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(notes, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving notes by status: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Send delete notification to all connected clients
    private void sendDeleteUpdateToClients(Long commentId) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send("deleted:" + commentId);
            } catch (IOException e) {
                emitter.completeWithError(e);
                clients.remove(emitter);
            }
        }
    }
}
