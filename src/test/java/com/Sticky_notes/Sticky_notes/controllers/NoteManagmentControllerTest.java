package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.models.NoteManagment;
import com.Sticky_notes.Sticky_notes.repository.NoteManagmentRepository;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
import com.Sticky_notes.Sticky_notes.security.CustomUserDetailsService;
import com.Sticky_notes.Sticky_notes.security.JwtAuthenticationEntryPoint;
import com.Sticky_notes.Sticky_notes.security.JwtAuthenticationFilter;
import com.Sticky_notes.Sticky_notes.security.JwtTokenProvider;
import com.Sticky_notes.Sticky_notes.services.NoteManagmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NoteManagmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class NoteManagmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NoteManagmentService noteService;

    @MockBean
    private NoteManagmentRepository noteManagmentRepository;

    @MockBean
    private NoteRepository legacyNoteRepository;

    // Mock security user details service to avoid JPA user repo
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    // Mock JWT security infrastructure to avoid full security context wiring
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private NoteManagment nm(Long id, String status, String user, String board) {
        NoteManagment n = new NoteManagment();
        n.setId(id);
        n.setTitle("t");
        n.setContent("c");
        n.setX(10);
        n.setY(20);
        n.setStatus(status);
        n.setUsername(user);
        n.setIsPrivate(false);
        n.setBoardType(board);
        n.setDone("done".equalsIgnoreCase(status));
        return n;
    }

    private Note legacy(Long id, boolean done, String user, String board) {
        Note n = new Note();
        n.setId(id);
        n.setText("legacy");
        n.setX(5);
        n.setY(6);
        n.setDone(done);
        n.setUsername(user);
        n.setIsPrivate(false);
        n.setBoardType(board);
        return n;
    }

    @Test
    @WithMockUser(username = "john")
    void getDoneNotesFromNoteManagment_filtersByUserAndBoard() throws Exception {
        given(noteService.getNotesByStatus(eq("done")))
                .willReturn(List.of(
                        nm(1L, "done", "john", "profile"),
                        nm(2L, "done", "alice", "profile"),
                        nm(3L, "done", "john", "main")
                ));

        mockMvc.perform(get("/api/note-management/by-status/done")
                        .param("boardType", "profile")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("john"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username", is("john")))
                .andExpect(jsonPath("$[0].boardType", is("profile")))
                .andExpect(jsonPath("$[0].status", is("done")));
    }

    @Test
    @WithMockUser(username = "john")
    void getDoneNotesFallbackToLegacy_whenNoNoteManagment() throws Exception {
        given(noteService.getNotesByStatus(eq("done"))).willReturn(List.of());
        given(legacyNoteRepository.findByUsernameAndDoneTrueAndBoardType(eq("john"), eq("profile")))
                .willReturn(List.of(legacy(10L, true, "john", "profile")));

        mockMvc.perform(get("/api/note-management/by-status/done")
                        .param("boardType", "profile")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username", is("john")))
                .andExpect(jsonPath("$[0].boardType", is("profile")))
                .andExpect(jsonPath("$[0].status", is("done")));
    }

    @Test
    @WithMockUser(username = "john")
    void getDeletedNotesFallbackToLegacy_whenNoNoteManagment() throws Exception {
        given(noteService.getNotesByStatus(eq("deleted"))).willReturn(List.of());
        given(legacyNoteRepository.findByUsernameAndDoneTrueAndBoardType(eq("john"), eq("main")))
                .willReturn(List.of(legacy(20L, true, "john", "main")));

        mockMvc.perform(get("/api/note-management/by-status/deleted")
                        .param("boardType", "main")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username", is("john")))
                .andExpect(jsonPath("$[0].boardType", is("main")))
                .andExpect(jsonPath("$[0].status", is("deleted")));
    }

    @Test
    @WithMockUser(username = "john")
    void whenNoteManagmentFilteredEmpty_fallsBackToLegacy() throws Exception {
        given(noteService.getNotesByStatus(eq("done"))).willReturn(List.of(
                nm(2L, "done", "alice", "profile")
        ));
        // After controller filters by username, list becomes empty -> fallback
        given(legacyNoteRepository.findByUsernameAndDoneTrueAndBoardType(eq("john"), eq("profile")))
                .willReturn(List.of(legacy(30L, true, "john", "profile")));

        mockMvc.perform(get("/api/note-management/by-status/done")
                        .param("boardType", "profile")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username", is("john")))
                .andExpect(jsonPath("$[0].boardType", is("profile")))
                .andExpect(jsonPath("$[0].status", is("done")));
    }

    @Test
    @WithMockUser(username = "john")
    void restoreEndpoint_restoresLegacyNote_whenNoteManagmentMissing() throws Exception {
        given(noteService.updateNoteStatus(anyLong(), eq("active"))).willReturn(Optional.empty());
        Note original = legacy(40L, true, "john", "profile");
        given(legacyNoteRepository.findById(eq(40L))).willReturn(Optional.of(original));
        // After controller sets done=false and saves, return updated entity
        Note updated = legacy(40L, false, "john", "profile");
        given(legacyNoteRepository.save((Note) any())).willReturn(updated);

        mockMvc.perform(post("/api/note-management/{id}/restore", 40L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(40)))
                .andExpect(jsonPath("$.status", is("active")))
                .andExpect(jsonPath("$.done", is(false)));
    }
}
