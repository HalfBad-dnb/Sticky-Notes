package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.Comment;
import com.Sticky_notes.Sticky_notes.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8080", "http://localhost:8081"})
public class CommentController {

    private final CommentRepository commentRepository;

    // List of connected SSE clients
    private final CopyOnWriteArrayList<SseEmitter> clients = new CopyOnWriteArrayList<>();

    @Autowired
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
    public ResponseEntity<List<Comment>> getAllComments() {
        try {
            // Get all public comments for the main board
            List<Comment> publicComments = commentRepository.findByIsPrivateFalseAndBoardType("main");
            
            // Sort by likes in descending order
            List<Comment> sortedComments = publicComments.stream()
                .sorted(Comparator.comparing(
                    comment -> comment.getLikes() != null ? comment.getLikes() : 0,
                    Comparator.reverseOrder()
                ))
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
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Comment>> getCommentsByUsername(@PathVariable String username) {
        try {
            // Get all comments for this user (both private and public)
            List<Comment> allUserComments = commentRepository.findByUsername(username);
            
            System.out.println("Found " + allUserComments.size() + " comments for user: " + username);
            
            // Log all comments for debugging
            for (Comment comment : allUserComments) {
                System.out.println("Comment ID: " + comment.getId() + 
                                 ", Text: " + comment.getText() + 
                                 ", BoardType: " + comment.getBoardType() + 
                                 ", IsPrivate: " + comment.getIsPrivate());
            }
            
            // Always return all notes for this user, regardless of boardType
            // This is a temporary fix to ensure notes are displayed
            List<Comment> profileComments = allUserComments;
            System.out.println("Returning all " + profileComments.size() + " notes for user");
            
            // Log the notes being returned
            for (Comment comment : profileComments) {
                System.out.println("Returning note ID: " + comment.getId() + 
                                 ", Text: " + comment.getText() + 
                                 ", BoardType: " + comment.getBoardType() + 
                                 ", IsPrivate: " + comment.getIsPrivate());
            }
                
            if (profileComments.isEmpty()) {
                System.out.println("No profile comments found, returning 204 No Content");
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            System.out.println("Returning " + profileComments.size() + " profile comments with HTTP 200 OK");
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
            
            System.out.println("Found " + privateComments.size() + " private comments for user: " + username);
            
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
            // Set default values if not provided
            if (comment.getLikes() == null) comment.setLikes(0);
            if (comment.getDislikes() == null) comment.setDislikes(0);
            
            // Ensure boardType is set
            if (comment.getBoardType() == null) {
                comment.setBoardType("main"); // Default to main board if not specified
            }
            
            // Validate that boardType is either "main" or "profile"
            if (!"main".equals(comment.getBoardType()) && !"profile".equals(comment.getBoardType())) {
                comment.setBoardType("main"); // Default to main if invalid value
            }
            
            System.out.println("Creating comment with boardType: " + comment.getBoardType());
            
            Comment savedComment = commentRepository.save(comment);
            sendUpdateToClients(savedComment); // Notify clients about the new comment
            return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
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

    @PutMapping("/{id}/like")
    public ResponseEntity<Comment> likeComment(@PathVariable Long id) {
        try {
            Optional<Comment> commentOpt = commentRepository.findById(id);
            if (commentOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Comment comment = commentOpt.get();
            comment.setLikes(comment.getLikes() + 1);
            Comment savedComment = commentRepository.save(comment);
            // Notify clients about the updated comment
            sendUpdateToClients(savedComment);
            return new ResponseEntity<>(savedComment, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<?> dislikeComment(@PathVariable Long id) {
        try {
            Optional<Comment> commentOpt = commentRepository.findById(id);
            if (commentOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Increment dislikes
            Comment comment = commentOpt.get();
            comment.setDislikes(comment.getDislikes() + 1);

            // If dislikes reach 20, delete the comment and notify clients
            if (comment.getDislikes() >= 20) {
                commentRepository.deleteById(id);  // Automatically remove comment
                sendDeleteUpdateToClients(id);     // Notify clients about deletion
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);  // No content response
            }

            // Otherwise, save the updated comment
            Comment savedComment = commentRepository.save(comment);
            // Notify clients about the updated comment
            sendUpdateToClients(savedComment);
            return new ResponseEntity<>(savedComment, HttpStatus.OK);
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
