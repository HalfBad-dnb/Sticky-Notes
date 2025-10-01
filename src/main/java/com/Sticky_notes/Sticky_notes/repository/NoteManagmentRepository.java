package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.NoteManagment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NoteManagmentRepository extends JpaRepository<NoteManagment, Long> {
    List<NoteManagment> findByStatus(String status);
    List<NoteManagment> findByUsername(String username);
    
    @Query("SELECT DISTINCT n.status FROM NoteManagment n")
    List<String> findDistinctStatuses();
}