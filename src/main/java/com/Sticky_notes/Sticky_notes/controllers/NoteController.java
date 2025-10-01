package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
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
@RequestMapping("/api/notes")
public class NoteController {
    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);

    private final NoteRepository noteRepository;

    // List of connected SSE clients
    private final CopyOnWriteArrayList<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // SSE stream to send updates to connected clients
    @GetMapping(value = "/sse", produces = "text/event-stream")
    public SseEmitter streamnotes() {
        SseEmitter emitter = new SseEmitter();
        clients.add(emitter);

        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> clients.remove(emitter));

        return emitter;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllnotes(@RequestParam(required = false) String username) {
        try {
            List<Note> notes;
            
            if (username != null && !username.isEmpty()) {
                // Get user's public notes for the main board
                notes = noteRepository.findByUsernameAndIsPrivateFalseAndBoardType(username, "main");
            } else {
                // Get all public notes for the main board (for guests)
                notes = noteRepository.findByIsPrivateFalseAndBoardType("main");
            }
            
            // Sort by creation time (most recent first)
            List<Note> sortednotes = notes.stream()
                .sorted(Comparator.comparing(Note::getId).reversed())
                .collect(java.util.stream.Collectors.toList());
            
            if (sortednotes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(sortednotes, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/profile/{username}")
    public ResponseEntity<List<Note>> getUserProfilenotes(
            @PathVariable String username,
            @RequestParam(required = false) Boolean isPrivate) {
        try {
            List<Note> profilenotes;
            
            // If isPrivate parameter is provided, filter by privacy status
            if (isPrivate != null) {
                if (isPrivate) {
                    // Get only private profile notes
                    profilenotes = noteRepository.findByUsernameAndIsPrivateTrueAndBoardType(username, "profile");
                } else {
                    // Get only public profile notes
                    profilenotes = noteRepository.findByUsernameAndIsPrivateFalseAndBoardType(username, "profile");
                }
            } else {
                // Get all profile notes (both public and private)
                profilenotes = noteRepository.findByUsernameAndBoardType(username, "profile");
            }
            
            // Sort by creation time (newest first)
            profilenotes.sort(Comparator.comparing(Note::getId).reversed());
            
            logger.debug("Found {} profile notes for user: {} (isPrivate={})", 
                profilenotes.size(), username, isPrivate);
            
            if (profilenotes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(profilenotes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving profile notes for user {}: {}", username, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Note>> getnotesByUsername(@PathVariable String username) {
        try {
            // Get only profile board notes for this user
            List<Note> profilenotes = noteRepository.findByUsernameAndBoardType(username, "profile");
            
            logger.debug("Found {} profile notes for user: {}", profilenotes.size(), username);
            
            // Log all profile notes for debugging
            for (Note note : profilenotes) {
                logger.trace("Profile note - ID: {}, Text: {}, BoardType: {}, IsPrivate: {}", 
                    note.getId(), note.getText(), note.getBoardType(), note.getIsPrivate());
            }
                
            if (profilenotes.isEmpty()) {
                logger.info("No profile notes found for user: {}", username);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            logger.debug("Returning {} profile notes with HTTP 200 OK", profilenotes.size());
            return new ResponseEntity<>(profilenotes, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}/private")
    public ResponseEntity<List<Note>> getPrivatenotesByUsername(@PathVariable String username) {
        try {
            // Get only private notes for this user
            List<Note> privatenotes = noteRepository.findByUsernameAndIsPrivateTrue(username);
            
            logger.debug("Found {} private notes for user: {}", privatenotes.size(), username);
            
            // For backward compatibility, if there are no private notes with boardType="profile",
            // return all private notes for this user
            boolean hasPrivateProfileNotes = privatenotes.stream()
                .anyMatch(note -> "profile".equals(note.getBoardType()));
                
            List<Note> privateProfilenotes;
            if (hasPrivateProfileNotes) {
                // If there are private profile notes, filter to include only those
                privateProfilenotes = privatenotes.stream()
                    .filter(note -> "profile".equals(note.getBoardType()))
                    .collect(java.util.stream.Collectors.toList());
            } else {
                // For backward compatibility, if no private profile notes exist, return all private notes
                privateProfilenotes = privatenotes;
            }
                
            if (privateProfilenotes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(privateProfilenotes, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{username}/public")
    public ResponseEntity<List<Note>> getPublicnotesByUsername(@PathVariable String username) {
        try {
            // Get only public notes for this user
            List<Note> notes = noteRepository.findByUsernameAndIsPrivateFalse(username);
            if (notes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(notes, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Note> createnote(@Valid @RequestBody Note note) {
        try {
            // Initialize done to false if null
            note.setDone(note.isDone());
            
            // Ensure boardType is set
            if (note.getBoardType() == null) {
                note.setBoardType("main"); // Default to main board if not specified
            }
            
            // Validate that boardType is either "main" or "profile"
            if (!"main".equals(note.getBoardType()) && !"profile".equals(note.getBoardType())) {
                note.setBoardType("main"); // Default to main if invalid value
            }
            
            // Ensure isPrivate is set
            if (note.getIsPrivate() == null) {
                note.setIsPrivate(false);
            }
            
            logger.debug("Creating note with boardType: {}, isPrivate: {}", 
                note.getBoardType(), note.getIsPrivate());
            
            Note savednote = noteRepository.save(note);
            sendUpdateToClients(savednote); // Notify clients about the new note
            return new ResponseEntity<>(savednote, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating note: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updatenotePosition(@PathVariable Long id, @RequestBody Note updatedPosition) {
        try {
            Optional<Note> existingnoteOpt = noteRepository.findById(id);
            if (existingnoteOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Note note = existingnoteOpt.get();
            note.setX(updatedPosition.getX());
            note.setY(updatedPosition.getY());
            Note savednote = noteRepository.save(note);
            return new ResponseEntity<>(savednote, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/done")
    public ResponseEntity<Note> markAsDone(@PathVariable Long id) {
        try {
            Optional<Note> noteOpt = noteRepository.findById(id);
            if (noteOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Note note = noteOpt.get();
            note.setDone(true);
            Note savednote = noteRepository.save(note);
            // Notify clients about the updated note
            sendUpdateToClients(savednote);
            return new ResponseEntity<>(savednote, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletenote(@PathVariable Long id) {
        try {
            if (!noteRepository.existsById(id)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            noteRepository.deleteById(id);
            // Notify clients about the deleted note
            sendDeleteUpdateToClients(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Send note updates to all connected clients
    private void sendUpdateToClients(Note note) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(note);
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
     * @return List of notes matching the criteria
     */
    @GetMapping("/by-status")
    public ResponseEntity<List<Note>> getNotesByStatus(
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "profile") String boardType,
            Authentication authentication) {
        
        if (authentication == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        String username = authentication.getName();
        List<Note> notes;
        
        try {
            if ("done".equalsIgnoreCase(status) || "deleted".equalsIgnoreCase(status)) {
                // For both done and deleted, we use the same query since deleted is marked by done=true
                notes = noteRepository.findByUsernameAndDoneTrueAndBoardType(username, boardType);
                
                // If we need to distinguish between done and deleted in the future, we can add a deleted flag to the note model
                // and update the query accordingly
            } else {
                // For active notes (not done/deleted)
                notes = noteRepository.findByUsernameAndDoneFalseAndBoardType(username, boardType);
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
    private void sendDeleteUpdateToClients(Long noteId) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send("deleted:" + noteId);
            } catch (IOException e) {
                emitter.completeWithError(e);
                clients.remove(emitter);
            }
        }
    }
}
