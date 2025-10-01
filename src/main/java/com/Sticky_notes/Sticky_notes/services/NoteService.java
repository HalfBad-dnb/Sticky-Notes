package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {
    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> getAllnotes() {
        return noteRepository.findAll();
    }

    public Note addnote(Note note) {
        return noteRepository.save(note);
    }

    public Note markAsDone(Long id) {
        Note note = noteRepository.findById(id).orElseThrow();
        note.setDone(true);
        return noteRepository.save(note);
    }
    
    public void deletenote(Long id) {
        noteRepository.deleteById(id);
    }
}
