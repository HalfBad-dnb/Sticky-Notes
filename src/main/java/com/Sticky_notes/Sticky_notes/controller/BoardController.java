package com.Sticky_notes.Sticky_notes.controller;

import com.Sticky_notes.Sticky_notes.models.Board;
import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.services.BoardService;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
import com.Sticky_notes.Sticky_notes.dto.BoardDTO;
import com.Sticky_notes.Sticky_notes.dto.NoteDTO;
import com.Sticky_notes.Sticky_notes.dto.BoardMapper;
import com.Sticky_notes.Sticky_notes.dto.NoteMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8080", "http://localhost:8081"}, allowCredentials = "true")
public class BoardController {

    @Autowired
    private BoardService boardService;
    
    @Autowired
    private NoteRepository noteRepository;

    // Get all boards for authenticated user
    @GetMapping
    public ResponseEntity<?> getBoards(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }
            
            String username = authentication.getName();
            List<Board> boards = boardService.getBoardsForUser(username);
            
            // Add user count to each board (mock for now)
            List<BoardDTO> boardDTOs = boards.stream()
                .map(BoardMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(boardDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching boards: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching boards: " + e.getMessage());
        }
    }

    // Get public boards only
    @GetMapping("/public")
    public ResponseEntity<?> getPublicBoards() {
        try {
            List<Board> boards = boardService.getPublicBoards();
            
            List<Map<String, Object>> response = boards.stream()
                .map(board -> {
                    Map<String, Object> boardMap = new HashMap<>();
                    boardMap.put("id", board.getId());
                    boardMap.put("name", board.getName());
                    boardMap.put("description", board.getDescription());
                    boardMap.put("isPublic", board.isPublic());
                    boardMap.put("createdBy", board.getCreatedBy());
                    boardMap.put("createdAt", board.getCreatedAt());
                    boardMap.put("userCount", 1); // Mock user count
                    return boardMap;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching public boards");
        }
    }

    // Create a new board
    @PostMapping
    public ResponseEntity<?> createBoard(@RequestBody Map<String, Object> boardData, 
                                       Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "anonymous";
            
            String name = (String) boardData.get("name");
            String description = (String) boardData.getOrDefault("description", "");
            Boolean isPublic = (Boolean) boardData.getOrDefault("isPublic", false);
            
            Board board = boardService.createBoard(name, description, isPublic, username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", board.getId());
            response.put("name", board.getName());
            response.put("description", board.getDescription());
            response.put("isPublic", board.isPublic());
            response.put("createdBy", board.getCreatedBy());
            response.put("createdAt", board.getCreatedAt());
            response.put("userCount", 1);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Board creation failed: " + e.getMessage());
        }
    }

    // Delete a board
    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long boardId, 
                                       Authentication authentication) {
        try {
            System.out.println("DEBUG: Delete board called with boardId: " + boardId);
            System.out.println("DEBUG: Authentication: " + authentication);
            
            String username = authentication.getName();
            System.out.println("DEBUG: Username from auth: " + username);
            
            boolean deleted = boardService.deleteBoard(boardId, username);
            if (deleted) {
                return ResponseEntity.ok().body("Board deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Board not found");
            }
        } catch (IllegalArgumentException e) {
            System.out.println("DEBUG: IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("DEBUG: General Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token or authentication failed");
        }
    }

    // Get a specific board
    @GetMapping("/{boardId}")
    public ResponseEntity<?> getBoard(@PathVariable Long boardId,
                                    Authentication authentication) {
        try {
            String username = authentication.getName();
            
            Optional<Board> boardOptional = boardService.getBoardById(boardId);
            if (!boardOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Board not found");
            }
            
            Board board = boardOptional.get();
            
            // Check if user has access (created it or it's public)
            if (!board.getCreatedBy().equals(username) && !board.isPublic()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            BoardDTO boardDTO = BoardMapper.toDTO(board);
            return ResponseEntity.ok(boardDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token or authentication failed");
        }
    }
    
    // Get notes for a specific board
    @GetMapping("/{boardId}/notes")
    public ResponseEntity<List<NoteDTO>> getNotesByBoardId(@PathVariable Long boardId) {
        try {
            List<Note> notes = noteRepository.findByBoardId(boardId);
            List<NoteDTO> noteDTOs = notes.stream()
                .map(NoteMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(noteDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create a note for a specific board
    @PostMapping("/{boardId}/notes")
    public ResponseEntity<NoteDTO> createNoteForBoard(@PathVariable Long boardId, @RequestBody NoteDTO noteDTO) {
        try {
            Note note = NoteMapper.toEntity(noteDTO);
            note.setBoardId(boardId);
            
            // Initialize default values
            if (!note.isDone()) {
                note.setDone(false);
            }
            
            if (note.getBoardType() == null) {
                note.setBoardType("main");
            }
            
            if (note.getIsPrivate() == null) {
                note.setIsPrivate(false);
            }
            
            Note savedNote = noteRepository.save(note);
            NoteDTO responseDTO = NoteMapper.toDTO(savedNote);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
