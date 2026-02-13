package com.Sticky_notes.Sticky_notes.controller;

import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.models.NoteComment;
import com.Sticky_notes.Sticky_notes.repository.NoteCommentRepository;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
public class NoteCommentController {

    private final NoteRepository noteRepository;
    private final NoteCommentRepository noteCommentRepository;

    public NoteCommentController(NoteRepository noteRepository, NoteCommentRepository noteCommentRepository) {
        this.noteRepository = noteRepository;
        this.noteCommentRepository = noteCommentRepository;
    }

    public static class NoteCommentResponse {
        public Long id;
        public Long noteId;
        public String username;
        public String text;
        public java.time.Instant createdAt;
    }

    private static NoteCommentResponse toResponse(NoteComment c) {
        NoteCommentResponse r = new NoteCommentResponse();
        r.id = c.getId();
        r.noteId = c.getNote() != null ? c.getNote().getId() : null;
        r.username = c.getUsername();
        r.text = c.getText();
        r.createdAt = c.getCreatedAt();
        return r;
    }

    public static class CreateCommentRequest {
        @NotBlank
        public String text;
    }

    @GetMapping("/{noteId}/comments")
    public ResponseEntity<List<NoteCommentResponse>> listComments(@PathVariable Long noteId) {
        if (!noteRepository.existsById(noteId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<NoteCommentResponse> res = noteCommentRepository.findByNoteIdOrderByCreatedAtAsc(noteId)
                .stream()
                .map(NoteCommentController::toResponse)
                .toList();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping("/{noteId}/comments")
    public ResponseEntity<NoteCommentResponse> addComment(
            @PathVariable Long noteId,
            @Valid @RequestBody CreateCommentRequest req,
            Authentication authentication
    ) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        if (noteOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        String username = authentication != null ? authentication.getName() : null;
        if (username == null || username.isBlank()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        NoteComment comment = new NoteComment();
        comment.setNote(noteOpt.get());
        comment.setUsername(username);
        comment.setText(req.text);

        NoteComment saved = noteCommentRepository.save(comment);
        return new ResponseEntity<>(toResponse(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{noteId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long noteId,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null || username.isBlank()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<NoteComment> commentOpt = noteCommentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        NoteComment comment = commentOpt.get();
        if (comment.getNote() == null || comment.getNote().getId() == null || !comment.getNote().getId().equals(noteId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (!username.equals(comment.getUsername())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        noteCommentRepository.delete(comment);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
