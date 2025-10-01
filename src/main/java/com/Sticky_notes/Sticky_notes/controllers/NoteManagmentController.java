package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.NoteManagment;
import com.Sticky_notes.Sticky_notes.repository.NoteManagmentRepository;
import com.Sticky_notes.Sticky_notes.services.NoteManagmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/note-management")
public class NoteManagmentController {

    @Autowired
    private NoteManagmentService noteService;
    
    @Autowired
    private NoteManagmentRepository noteRepository;

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
    public ResponseEntity<List<NoteManagment>> getNotesByStatus(@PathVariable String status) {
        System.out.println("Fetching notes with status: " + status);
        List<NoteManagment> notes = noteService.getNotesByStatus(status);
        System.out.println("Found " + notes.size() + " notes with status " + status);
        if (!notes.isEmpty()) {
            System.out.println("First note: " + notes.get(0).toString());
        }
        return ResponseEntity.ok(notes);
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
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getDistinctStatuses() {
        System.out.println("Fetching distinct statuses...");
        List<String> statuses = noteRepository.findDistinctStatuses();
        System.out.println("Found statuses: " + statuses);
        return ResponseEntity.ok(statuses);
    }
}