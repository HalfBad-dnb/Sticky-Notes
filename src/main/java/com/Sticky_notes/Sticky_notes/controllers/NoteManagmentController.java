package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.NoteManagment;
import com.Sticky_notes.Sticky_notes.repository.NoteManagmentRepository;
import com.Sticky_notes.Sticky_notes.services.NoteManagmentService;
import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/note-management")
public class NoteManagmentController {

    @Autowired
    private NoteManagmentService noteService;
    
    @Autowired
    private NoteManagmentRepository noteRepository;

    @Autowired
    private NoteRepository legacyNoteRepository;

    @GetMapping
    public ResponseEntity<List<NoteManagment>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteManagment> getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<NoteManagment>> getNotesByStatus(
            @PathVariable String status,
            @RequestParam(required = false) String boardType,
            Authentication authentication) {
        System.out.println("Fetching notes with status: " + status);
        List<NoteManagment> notes = noteService.getNotesByStatus(status);
        System.out.println("Found " + notes.size() + " notes with status " + status);
        if (!notes.isEmpty()) {
            if (authentication != null) {
                String username = authentication.getName();
                notes = notes.stream()
                        .filter(n -> (boardType == null || boardType.equalsIgnoreCase(n.getBoardType())))
                        .filter(n -> username.equals(n.getUsername()))
                        .collect(java.util.stream.Collectors.toList());
            } else if (boardType != null) {
                String bt = boardType;
                notes = notes.stream()
                        .filter(n -> bt.equalsIgnoreCase(n.getBoardType()))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (!notes.isEmpty()) {
                return ResponseEntity.ok(notes);
            }
        }

        // Fallback: If NoteManagment has no records, look up legacy Note data by current user
        if (authentication == null) {
            return ResponseEntity.ok(notes); // empty
        }

        String username = authentication.getName();
        List<Note> legacy;
        if ("done".equalsIgnoreCase(status) || "deleted".equalsIgnoreCase(status)) {
            if (boardType == null || "all".equalsIgnoreCase(boardType)) {
                legacy = new java.util.ArrayList<>();
                legacy.addAll(legacyNoteRepository.findByUsernameAndDoneTrueAndBoardType(username, "main"));
                legacy.addAll(legacyNoteRepository.findByUsernameAndDoneTrueAndBoardType(username, "profile"));
            } else {
                legacy = legacyNoteRepository.findByUsernameAndDoneTrueAndBoardType(username, boardType);
            }
        } else {
            if (boardType == null || "all".equalsIgnoreCase(boardType)) {
                legacy = new java.util.ArrayList<>();
                legacy.addAll(legacyNoteRepository.findByUsernameAndDoneFalseAndBoardType(username, "main"));
                legacy.addAll(legacyNoteRepository.findByUsernameAndDoneFalseAndBoardType(username, "profile"));
            } else {
                legacy = legacyNoteRepository.findByUsernameAndDoneFalseAndBoardType(username, boardType);
            }
        }

        List<NoteManagment> mapped = legacy.stream().map(n -> {
            NoteManagment m = new NoteManagment();
            m.setId(n.getId());
            m.setTitle("");
            m.setContent(n.getText());
            m.setX(n.getX() != null ? n.getX() : 100);
            m.setY(n.getY() != null ? n.getY() : 100);
            m.setStatus("done".equalsIgnoreCase(status) ? "done" : ("deleted".equalsIgnoreCase(status) ? "deleted" : "active"));
            m.setUsername(n.getUsername());
            m.setIsPrivate(n.getIsPrivate());
            m.setBoardType(n.getBoardType());
            m.setDone(n.isDone());
            return m;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(mapped);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<NoteManagment>> getNotesByUser(@PathVariable String username) {
        return ResponseEntity.ok(noteService.getNotesByUsername(username));
    }

    @PostMapping
    public ResponseEntity<NoteManagment> createNote(@RequestBody NoteManagment note) {
        return ResponseEntity.ok(noteService.saveOrUpdateNote(note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteManagment> updateNote(@PathVariable Long id, @RequestBody NoteManagment noteDetails) {
        return noteService.getNoteById(id)
                .map(existingNote -> {
                    noteDetails.setId(id);
                    return ResponseEntity.ok(noteService.saveOrUpdateNote(noteDetails));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<NoteManagment> updateNoteStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return noteService.updateNoteStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<NoteManagment> updateNotePosition(
            @PathVariable Long id,
            @RequestParam int x,
            @RequestParam int y) {
        return noteService.updateNotePosition(id, x, y)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<NoteManagment> restoreNote(@PathVariable Long id) {
        return noteService.updateNoteStatus(id, "active")
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Fallback: try to restore legacy Note entity
                    return legacyNoteRepository.findById(id)
                            .map(n -> {
                                n.setDone(false);
                                Note saved = legacyNoteRepository.save(n);
                                NoteManagment m = new NoteManagment();
                                m.setId(saved.getId());
                                m.setTitle("");
                                m.setContent(saved.getText());
                                m.setX(saved.getX() != null ? saved.getX() : 100);
                                m.setY(saved.getY() != null ? saved.getY() : 100);
                                m.setStatus("active");
                                m.setUsername(saved.getUsername());
                                m.setIsPrivate(saved.getIsPrivate());
                                m.setBoardType(saved.getBoardType());
                                m.setDone(saved.isDone());
                                return ResponseEntity.ok(m);
                            })
                            .orElse(ResponseEntity.notFound().build());
                });
    }
    
    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getDistinctStatuses() {
        System.out.println("Fetching distinct statuses...");
        List<String> statuses = noteRepository.findDistinctStatuses();
        System.out.println("Found statuses: " + statuses);
        return ResponseEntity.ok(statuses);
    }
}