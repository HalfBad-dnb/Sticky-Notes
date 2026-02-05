package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.NoteComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteCommentRepository extends JpaRepository<NoteComment, Long> {
    List<NoteComment> findByNoteIdOrderByCreatedAtAsc(Long noteId);
}
