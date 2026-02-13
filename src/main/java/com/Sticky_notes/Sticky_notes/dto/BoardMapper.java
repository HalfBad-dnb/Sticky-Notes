package com.Sticky_notes.Sticky_notes.dto;

import com.Sticky_notes.Sticky_notes.models.Board;
import java.util.List;

public class BoardMapper {
    
    public static BoardDTO toDTO(Board board) {
        BoardDTO dto = new BoardDTO();
        dto.setId(board.getId());
        dto.setName(board.getName());
        dto.setDescription(board.getDescription());
        dto.setPublic(board.isPublic());
        dto.setCreatedBy(board.getCreatedBy());
        dto.setCreatedAt(board.getCreatedAt());
        dto.setCode(board.getCode());
        dto.setContent(board.getContent());
        dto.setTitle(board.getTitle());
        dto.setBoardType(board.getBoardType());
        dto.setUserCount(board.getBoardUsers() != null ? board.getBoardUsers().size() : 0);
        return dto;
    }
    
    public static Board toEntity(BoardDTO dto) {
        Board board = new Board();
        board.setId(dto.getId());
        board.setName(dto.getName());
        board.setDescription(dto.getDescription());
        board.setPublic(dto.isPublic());
        board.setCreatedBy(dto.getCreatedBy());
        board.setBoardType(dto.getBoardType());
        board.setContent(dto.getContent());
        board.setTitle(dto.getTitle());
        return board;
    }
}
