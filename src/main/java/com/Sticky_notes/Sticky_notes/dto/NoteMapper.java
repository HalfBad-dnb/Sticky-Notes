package com.Sticky_notes.Sticky_notes.dto;

import com.Sticky_notes.Sticky_notes.models.Note;
import java.util.List;

public class NoteMapper {
    
    public static NoteDTO toDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setX(note.getX());
        dto.setY(note.getY());
        dto.setText(note.getText());
        dto.setDone(note.isDone());
        dto.setUsername(note.getUsername());
        dto.setIsPrivate(note.getIsPrivate());
        dto.setBoardType(note.getBoardType());
        dto.setBoardId(note.getBoardId());
        return dto;
    }
    
    public static Note toEntity(NoteDTO dto) {
        Note note = new Note();
        note.setId(dto.getId());
        note.setX(dto.getX());
        note.setY(dto.getY());
        note.setText(dto.getText());
        note.setDone(dto.isDone());
        note.setUsername(dto.getUsername());
        note.setIsPrivate(dto.getIsPrivate());
        note.setBoardType(dto.getBoardType());
        note.setBoardId(dto.getBoardId());
        return note;
    }
}
