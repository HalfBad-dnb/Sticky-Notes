package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Comment entity, providing CRUD operations and custom queries.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Optional: Custom query to find comments by color (example enhancement)
    List<Comment> findByColor(String color);

    // Optional: Custom query to find comments containing specific text (case-insensitive)
    List<Comment> findByTextContainingIgnoreCase(String text);
}