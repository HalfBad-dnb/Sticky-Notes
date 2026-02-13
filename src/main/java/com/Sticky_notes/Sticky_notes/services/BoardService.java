package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.Board;
import com.Sticky_notes.Sticky_notes.models.BoardUser;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.BoardRepository;
import com.Sticky_notes.Sticky_notes.repository.BoardUserRepository;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoardService {

    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);

    @Autowired
    private BoardRepository boardRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BoardUserRepository boardUserRepository;

    // Get all boards for a user (their boards + public boards)
    public List<Board> getBoardsForUser(String username) {
        return boardRepository.findAccessibleBoards(username);
    }

    // Get all public boards
    public List<Board> getPublicBoards() {
        return boardRepository.findByIsPublicTrue();
    }

    // Create a new board
    public Board createBoard(String name, String description, boolean isPublic, String createdBy) {
        // Check if board name already exists for this user
        Optional<Board> existingBoard = boardRepository.findByNameAndCreatedBy(name, createdBy);
        if (existingBoard.isPresent()) {
            throw new IllegalArgumentException("Board with name '" + name + "' already exists");
        }

        // Find the user (skip for anonymous users)
        User user = null;
        if (!"anonymous".equals(createdBy)) {
            Optional<User> userOptional = userRepository.findByUsername(createdBy);
            if (!userOptional.isPresent()) {
                throw new IllegalArgumentException("User not found: " + createdBy);
            }
            user = userOptional.get();
        }

        // Create new board
        Board board = new Board(name, description, isPublic, createdBy);
        board.setUser(user);
        
        // Generate a unique code for the board
        String uniqueCode = generateUniqueCode(name);
        board.setCode(uniqueCode);
        
        // Set default values to avoid database constraint errors
        board.setContent("");
        board.setTitle(name); // Use name as title
        board.setBoardType("GENERAL"); // Default board type
        
        // Debug logging
        logger.info("Board before save: name={}, boardType={}, code={}, title={}, content={}", 
                   board.getName(), board.getBoardType(), board.getCode(), board.getTitle(), board.getContent());
        
        Board savedBoard = boardRepository.save(board);
        
        // Create board user assignment for the creator (if not anonymous)
        if (!"anonymous".equals(createdBy)) {
            BoardUser boardUser = new BoardUser(createdBy, "admin", savedBoard);
            boardUserRepository.save(boardUser);
            logger.info("Created board user assignment: username={}, role={}, boardId={}", 
                       createdBy, "admin", savedBoard.getId());
        }
        
        return savedBoard;
    }
    
    // Generate a unique code based on the board name
    private String generateUniqueCode(String name) {
        // Create a base code from the name (lowercase, no spaces, no special chars)
        String baseCode = name.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");
        
        // If baseCode is empty, use a default
        if (baseCode.isEmpty()) {
            baseCode = "board";
        }
        
        // Ensure it's not too long
        if (baseCode.length() > 20) {
            baseCode = baseCode.substring(0, 20);
        }
        
        // Add timestamp to ensure uniqueness
        String uniqueCode = baseCode + "_" + System.currentTimeMillis();
        
        return uniqueCode;
    }

    // Delete a board
    public boolean deleteBoard(Long boardId, String username) {
        Optional<Board> boardOptional = boardRepository.findById(boardId);
        if (!boardOptional.isPresent()) {
            return false;
        }

        Board board = boardOptional.get();
        // Only allow deletion if user is the creator
        if (!board.getCreatedBy().equals(username)) {
            throw new IllegalArgumentException("You can only delete boards you created");
        }

        boardRepository.delete(board);
        return true;
    }

    // Get board by ID
    public Optional<Board> getBoardById(Long boardId) {
        return boardRepository.findById(boardId);
    }

    // Update board
    public Board updateBoard(Long boardId, String name, String description, boolean isPublic, String username) {
        Optional<Board> boardOptional = boardRepository.findById(boardId);
        if (!boardOptional.isPresent()) {
            throw new IllegalArgumentException("Board not found");
        }

        Board board = boardOptional.get();
        // Only allow update if user is the creator
        if (!board.getCreatedBy().equals(username)) {
            throw new IllegalArgumentException("You can only update boards you created");
        }

        // Check if new name conflicts with existing boards (excluding this one)
        if (!board.getName().equals(name)) {
            Optional<Board> existingBoard = boardRepository.findByNameAndCreatedBy(name, username);
            if (existingBoard.isPresent() && !existingBoard.get().getId().equals(boardId)) {
                throw new IllegalArgumentException("Board with name '" + name + "' already exists");
            }
        }

        board.setName(name);
        board.setDescription(description);
        board.setPublic(isPublic);

        return boardRepository.save(board);
    }
}
