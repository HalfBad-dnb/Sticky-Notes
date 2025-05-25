package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.Comment;
import com.Sticky_notes.Sticky_notes.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    public Comment dislikeComment(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow();

        // Increase dislikes
        comment.setDislikes(comment.getDislikes() + 1);

        // If dislikes reach 20, delete the comment and return null
        if (comment.getDislikes() >= 20) {
            commentRepository.deleteById(id);
            return null;
        }

        return commentRepository.save(comment);
    }
}
