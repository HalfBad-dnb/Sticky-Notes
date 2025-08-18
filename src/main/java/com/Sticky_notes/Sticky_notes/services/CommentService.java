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

    public Comment markAsDone(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow();
        comment.setDone(true);
        return commentRepository.save(comment);
    }
    
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
