package com.Sticky_notes.Sticky_notes.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.Sticky_notes.Sticky_notes.models.Board;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.BoardRepository;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/create")
    public Board createBoard(@RequestBody Board board, Authentication authentication) {
        // Get the authenticated user
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Validate board data if necessary (e.g., check if required fields are present)
        if (board.getTitle() == null || board.getTitle().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Board title is required");
        }

        // Set the user for the board
        board.setUser(user);

        // Save the board to the repository
        return boardRepository.save(board);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/mine")
    public List<Board> getUserBoard(Authentication authentication) {
        // Get the authenticated user
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Retrieve boards that belong to the authenticated user
        return boardRepository.findByUser(user);
    }
}
