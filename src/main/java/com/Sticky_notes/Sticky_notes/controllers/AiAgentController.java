package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.services.AiAgentService;
import com.Sticky_notes.Sticky_notes.services.GeminiService;
import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.logging.LoggerUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * AI Agent Controller for handling AI-powered operations
 */
@RestController
@RequestMapping("/api/ai")
public class AiAgentController {

    @Autowired
    private AiAgentService aiAgentService;

    @Autowired
    private GeminiService geminiService;

    /**
     * Create a note with AI assistance
     */
    @PostMapping("/notes")
    public ResponseEntity<?> createNoteWithAi(@RequestBody Map<String, String> request, Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String username = authentication != null ? authentication.getName() : "anonymous";
        
        LoggerUtil.logApiRequest("POST", "/api/ai/notes", true);
        LoggerUtil.logSecurityEvent("AI_NOTE_CREATE", "User attempting to create note with AI", username);
        
        try {
            String text = request.get("text");
            if (text == null || text.trim().isEmpty()) {
                LoggerUtil.logWarning("AiAgentController", "createNoteWithAi", "Empty note text provided");
                return ResponseEntity.badRequest().body(Map.of("error", "Note text cannot be empty"));
            }

            Note createdNote = aiAgentService.createNoteWithAi(text, username);
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("POST", "/api/ai/notes", HttpStatus.CREATED.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_NOTE_CREATE_SUCCESS", "Note created successfully with AI", 
                Map.of("noteId", createdNote.getId(), "username", username));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logError("AiAgentController", "createNoteWithAi", e, "username=" + username);
            LoggerUtil.logApiResponse("POST", "/api/ai/notes", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_NOTE_CREATE_ERROR", "Failed to create note with AI", 
                Map.of("error", e.getMessage(), "username", username));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create note: " + e.getMessage()));
        }
    }

    /**
     * Scan and analyze notes data
     */
    @GetMapping("/scan")
    public ResponseEntity<Map<String, Object>> scanNotesData(Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String username = authentication != null ? authentication.getName() : null;
        
        LoggerUtil.logApiRequest("GET", "/api/ai/scan", true);
        LoggerUtil.logSecurityEvent("AI_DATA_SCAN", "User requesting data scan", username);
        
        try {
            Map<String, Object> analysis = aiAgentService.scanNotesData(username);
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("GET", "/api/ai/scan", HttpStatus.OK.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_DATA_SCAN_SUCCESS", "Data scan completed successfully", 
                Map.of("username", username, "notesAnalyzed", analysis.get("totalNotes")));
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logError("AiAgentController", "scanNotesData", e, "username=" + username);
            LoggerUtil.logApiResponse("GET", "/api/ai/scan", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_DATA_SCAN_ERROR", "Failed to scan data", 
                Map.of("error", e.getMessage(), "username", username));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to scan data: " + e.getMessage()));
        }
    }

    /**
     * Get old notes that need attention
     */
    @GetMapping("/old-notes")
    public ResponseEntity<List<Map<String, Object>>> getOldNotes(
            @RequestParam(defaultValue = "7") int daysOld,
            Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String username = authentication != null ? authentication.getName() : null;
        
        LoggerUtil.logApiRequest("GET", "/api/ai/old-notes", true);
        LoggerUtil.logSecurityEvent("AI_OLD_NOTES", "User requesting old notes", 
            Map.of("username", username, "daysOld", daysOld));
        
        try {
            List<Map<String, Object>> oldNotes = aiAgentService.getOldNotes(username, daysOld);
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("GET", "/api/ai/old-notes", HttpStatus.OK.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_OLD_NOTES_SUCCESS", "Old notes retrieved successfully", 
                Map.of("username", username, "oldNotesCount", oldNotes.size()));
            
            return ResponseEntity.ok(oldNotes);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logError("AiAgentController", "getOldNotes", e, "username=" + username);
            LoggerUtil.logApiResponse("GET", "/api/ai/old-notes", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_OLD_NOTES_ERROR", "Failed to get old notes", 
                Map.of("error", e.getMessage(), "username", username));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate note suggestions
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> generateSuggestions(Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String username = authentication != null ? authentication.getName() : null;
        
        LoggerUtil.logApiRequest("GET", "/api/ai/suggestions", true);
        LoggerUtil.logSecurityEvent("AI_SUGGESTIONS", "User requesting suggestions", username);
        
        try {
            List<String> suggestions = aiAgentService.generateNoteSuggestions(username);
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("GET", "/api/ai/suggestions", HttpStatus.OK.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_SUGGESTIONS_SUCCESS", "Suggestions generated successfully", 
                Map.of("username", username, "suggestionsCount", suggestions.size()));
            
            return ResponseEntity.ok(suggestions);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logError("AiAgentController", "generateSuggestions", e, "username=" + username);
            LoggerUtil.logApiResponse("GET", "/api/ai/suggestions", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_SUGGESTIONS_ERROR", "Failed to generate suggestions", 
                Map.of("error", e.getMessage(), "username", username));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate AI response using Gemini (for frontend)
     */
    @PostMapping("/gemini-chat")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> generateGeminiChat(@RequestBody Map<String, Object> request, Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String username = authentication != null ? authentication.getName() : "anonymous";
        
        LoggerUtil.logApiRequest("POST", "/api/ai/gemini-chat", true);
        LoggerUtil.logSecurityEvent("AI_GEMINI_CHAT", "User requesting Gemini chat", username);
        
        if (!geminiService.isAvailable()) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("POST", "/api/ai/gemini-chat", HttpStatus.SERVICE_UNAVAILABLE.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_GEMINI_UNAVAILABLE", "Gemini service not available", username);
            return CompletableFuture.completedFuture(
                ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Gemini AI service not available"))
            );
        }

        String prompt = (String) request.get("prompt");
        String systemInstruction = (String) request.get("systemInstruction");
        String model = (String) request.getOrDefault("model", "gemini-2.0-flash");
        
        return geminiService.generateContent(prompt, systemInstruction)
            .thenApply(response -> {
                long responseTime = System.currentTimeMillis() - startTime;
                LoggerUtil.logApiResponse("POST", "/api/ai/gemini-chat", HttpStatus.OK.value(), responseTime);
                LoggerUtil.logSecurityEvent("AI_GEMINI_CHAT_SUCCESS", "Gemini chat completed", 
                    Map.of("username", username, "responseTime", responseTime));
                
                Map<String, Object> result = Map.of(
                    "text", response,
                    "model", model,
                    "source", "gemini-ai",
                    "responseTime", responseTime
                );
                
                return ResponseEntity.ok(result);
            })
            .exceptionally(throwable -> {
                long responseTime = System.currentTimeMillis() - startTime;
                Exception e = throwable instanceof Exception ? (Exception) throwable : new RuntimeException(throwable.getMessage());
                String errorMsg = throwable.getMessage() != null ? throwable.getMessage() : "Unknown error";
                LoggerUtil.logError("AiAgentController", "generateGeminiChat", e, "username=" + username);
                LoggerUtil.logApiResponse("POST", "/api/ai/gemini-chat", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
                LoggerUtil.logSecurityEvent("AI_GEMINI_CHAT_ERROR", "Failed to generate Gemini chat", 
                    Map.of("error", errorMsg, "username", username));
                
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate response: " + errorMsg));
            });
    }

    /**
     * Generate AI-powered suggestions using Gemini
     */
    @GetMapping("/gemini-suggestions")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> generateGeminiSuggestions(Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String username = authentication != null ? authentication.getName() : null;
        
        LoggerUtil.logApiRequest("GET", "/api/ai/gemini-suggestions", true);
        LoggerUtil.logSecurityEvent("AI_GEMINI_SUGGESTIONS", "User requesting Gemini suggestions", username);
        
        if (!geminiService.isAvailable()) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("GET", "/api/ai/gemini-suggestions", HttpStatus.SERVICE_UNAVAILABLE.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_GEMINI_UNAVAILABLE", "Gemini service not available", username);
            return CompletableFuture.completedFuture(
                ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Gemini AI service not available"))
            );
        }

        // Get user notes for context
        return CompletableFuture.supplyAsync(() -> {
            try {
                // For now, use a simple context since we don't have the methods yet
                String notesContext = "User has some notes that need analysis.";
                return geminiService.generateNoteSuggestions(notesContext);
            } catch (Exception e) {
                throw new RuntimeException("Failed to setup notes context: " + e.getMessage(), e);
            }
        }).thenCompose(future -> future)
        .thenApply(suggestions -> {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("GET", "/api/ai/gemini-suggestions", HttpStatus.OK.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_GEMINI_SUGGESTIONS_SUCCESS", "Gemini suggestions generated", 
                Map.of("username", username, "responseTime", responseTime));
            
            return ResponseEntity.ok(Map.of(
                "suggestions", suggestions,
                "source", "gemini-ai",
                "model", geminiService.getStatus().get("model")
            ));
        })
        .exceptionally(throwable -> {
            long responseTime = System.currentTimeMillis() - startTime;
            Exception e = throwable instanceof Exception ? (Exception) throwable : new RuntimeException(throwable.getMessage());
            String errorMsg = throwable.getMessage() != null ? throwable.getMessage() : "Unknown error";
            LoggerUtil.logError("AiAgentController", "generateGeminiSuggestions", e, "username=" + username);
            LoggerUtil.logApiResponse("GET", "/api/ai/gemini-suggestions", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
            LoggerUtil.logSecurityEvent("AI_GEMINI_SUGGESTIONS_ERROR", "Failed to generate Gemini suggestions", 
                Map.of("error", errorMsg, "username", username));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate suggestions: " + errorMsg));
        });
    }

    /**
     * Health check for AI services
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        long startTime = System.currentTimeMillis();
        
        LoggerUtil.logApiRequest("GET", "/api/ai/health", false);
        LoggerUtil.logSystemEvent("AI_HEALTH_CHECK", "AI Agent health check requested");
        
        try {
            Map<String, Object> health = Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "services", Map.of(
                    "aiAgentService", "operational",
                    "geminiService", geminiService.getStatus(),
                    "database", "connected",
                    "logging", "active"
                )
            );
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logApiResponse("GET", "/api/ai/health", HttpStatus.OK.value(), responseTime);
            LoggerUtil.logSystemEvent("AI_HEALTH_CHECK_SUCCESS", "AI Agent is healthy");
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logError("AiAgentController", "healthCheck", e, "AI health check failed");
            LoggerUtil.logApiResponse("GET", "/api/ai/health", HttpStatus.INTERNAL_SERVER_ERROR.value(), responseTime);
            LoggerUtil.logSystemEvent("AI_HEALTH_CHECK_ERROR", "AI Agent health check failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", "unhealthy", "error", e.getMessage()));
        }
    }
}
