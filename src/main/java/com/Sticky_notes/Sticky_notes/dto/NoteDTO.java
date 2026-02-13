package com.Sticky_notes.Sticky_notes.dto;

public class NoteDTO {
    private Long id;
    private Integer x;
    private Integer y;
    private String text;
    private boolean done;
    private String username;
    private Boolean isPrivate;
    private String boardType;
    private Long boardId;
    
    // Constructor
    public NoteDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }
    
    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    
    public String getBoardType() { return boardType; }
    public void setBoardType(String boardType) { this.boardType = boardType; }
    
    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }
}
