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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083"})
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
            // Get all comments from the database
            List<Comment> allComments = commentRepository.findAll();
            
            // Filter to include comments where isPrivate is FALSE or NULL
            List<Comment> publicComments = allComments.stream()
                .filter(comment -> comment.getIsPrivate() == null || !comment.getIsPrivate())
                .sorted(Comparator.comparing(Comment::getLikes, Comparator.reverseOrder()))
                .collect(java.util.stream.Collectors.toList());
            
            if (publicComments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(publicComments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Comment>> getCommentsByUsername(@PathVariable String username) {
        try {
            // Get all comments for this user (both private and public)
            List<Comment> comments = commentRepository.findByUsername(username);
            if (comments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}/private")
    public ResponseEntity<List<Comment>> getPrivateCommentsByUsername(@PathVariable String username) {
        try {
            // Get only private comments for this user
            List<Comment> comments = commentRepository.findByUsernameAndIsPrivateTrue(username);
            if (comments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(comments, HttpStatus.OK);
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
            if (comment.getLikes() == null) comment.setLikes(0);
            if (comment.getDislikes() == null) comment.setDislikes(0);
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

            // If dislikes reach 100, delete the comment and notify clients
            if (comment.getDislikes() >= 100) {
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
