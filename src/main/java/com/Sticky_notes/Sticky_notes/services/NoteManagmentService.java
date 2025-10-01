package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.NoteManagment;
import com.Sticky_notes.Sticky_notes.repository.NoteManagmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoteManagmentService {

    @Autowired
    private NoteManagmentRepository noteRepository;

    public List<NoteManagment> getAllNotes() {
        return noteRepository.findAll();
    }

    public Optional<NoteManagment> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public List<NoteManagment> getNotesByStatus(String status) {
        return noteRepository.findByStatus(status);
    }

    public List<NoteManagment> getNotesByUsername(String username) {
        return noteRepository.findByUsername(username);
    }

    public NoteManagment saveOrUpdateNote(NoteManagment note) {
        if (note.getId() == null) {
            // New note
            note.setCreatedAt(LocalDateTime.now());
        } else {
            // Existing note - preserve creation date
            noteRepository.findById(note.getId())
                .ifPresent(existingNote -> note.setCreatedAt(existingNote.getCreatedAt()));
        }
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public Optional<NoteManagment> updateNoteStatus(Long id, String status) {
        return noteRepository.findById(id).map(note -> {
            note.setStatus(status);
            note.setDone("done".equalsIgnoreCase(status));
            note.setUpdatedAt(LocalDateTime.now());
            return noteRepository.save(note);
        });
    }

    public Optional<NoteManagment> updateNotePosition(Long id, int x, int y) {
        return noteRepository.findById(id).map(note -> {
            note.setX(x);
            note.setY(y);
            note.setUpdatedAt(LocalDateTime.now());
            return noteRepository.save(note);
        });
    }

    public void deleteNote(Long id) {
        // Soft delete by updating status
        noteRepository.findById(id).ifPresent(note -> {
            note.setStatus("deleted");
            note.setUpdatedAt(LocalDateTime.now());
            noteRepository.save(note);
        });
    }
}