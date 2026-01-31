package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.Sticky_notes.models.Note;
import com.Sticky_notes.Sticky_notes.repository.NoteRepository;
import com.Sticky_notes.logging.LoggerUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Agent Service for handling AI operations with comprehensive logging
 */
@Service
public class AiAgentService {

    @Autowired
    private NoteRepository noteRepository;

    /**
     * Create a new note with AI assistance
     */
    public Note createNoteWithAi(String text, String username) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logAiOperation("CREATE_NOTE", "Starting note creation", text.substring(0, Math.min(50, text.length())));
        
        try {
            Note note = new Note();
            note.setText(text);
            note.setUsername(username);
            note.setX(Math.random() < 0.5 ? 100 : 200); // Random position
            note.setY(Math.random() < 0.5 ? 100 : 200);
            note.setBoardType("main");
            note.setIsPrivate(false);
            note.setDone(false);

            LoggerUtil.logDatabaseOperation("INSERT", "Note", "text", text.substring(0, 20));
            Note savedNote = noteRepository.save(note);
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logPerformance("Create Note with AI", responseTime, "Note ID: " + savedNote.getId());
            LoggerUtil.logNoteOperation("created", savedNote.getId(), "AI-assisted creation");
            
            return savedNote;
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logAiError("CREATE_NOTE", e, "Failed to create note: " + text.substring(0, 50));
            LoggerUtil.logPerformance("Create Note with AI", responseTime, "FAILED");
            throw e;
        }
    }

    /**
     * Scan and analyze notes data
     */
    public Map<String, Object> scanNotesData(String username) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logAiOperation("DATA_SCAN", "Starting comprehensive data scan", "User: " + username);
        
        try {
            // Fetch all notes for the user
            List<Note> userNotes;
            if (username != null) {
                LoggerUtil.logDatabaseOperation("SELECT", "Note", "username", username);
                userNotes = noteRepository.findByUsername(username);
            } else {
                LoggerUtil.logDatabaseOperation("SELECT", "Note", "all public notes");
                userNotes = noteRepository.findByIsPrivateFalse();
            }

            // Perform comprehensive analysis
            Map<String, Object> analysis = new HashMap<>();
            
            // Basic statistics
            analysis.put("totalNotes", userNotes.size());
            analysis.put("completedNotes", userNotes.stream().mapToInt(note -> note.isDone() ? 1 : 0).sum());
            analysis.put("activeNotes", userNotes.stream().mapToInt(note -> !note.isDone() ? 1 : 0).sum());
            
            // Find old notes (older than 7 days)
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            List<Map<String, Object>> oldNotes = userNotes.stream()
                .filter(note -> {
                    // Note: We'll need to add timestamp fields to Note model for proper filtering
                    return !note.isDone(); // For now, just filter by completion status
                })
                .map(note -> {
                    Map<String, Object> noteData = new HashMap<>();
                    noteData.put("id", note.getId());
                    noteData.put("text", note.getText());
                    noteData.put("username", note.getUsername());
                    noteData.put("done", note.isDone());
                    return noteData;
                })
                .collect(Collectors.toList());
            
            analysis.put("oldNotes", oldNotes);
            
            // Priority distribution (if we had priority field)
            Map<String, Integer> priorityDistribution = new HashMap<>();
            priorityDistribution.put("high", 0);
            priorityDistribution.put("medium", 0);
            priorityDistribution.put("low", 0);
            analysis.put("priorityDistribution", priorityDistribution);
            
            // Word cloud from note texts
            Map<String, Integer> wordCloud = new HashMap<>();
            userNotes.forEach(note -> {
                String[] words = note.getText().toLowerCase().split("\\s+");
                for (String word : words) {
                    if (word.length() > 3) {
                        wordCloud.put(word, wordCloud.getOrDefault(word, 0) + 1);
                    }
                }
            });
            
            // Keep only top 20 words
            final Map<String, Integer> finalWordCloud = wordCloud;
            Map<String, Integer> topWords = finalWordCloud.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(20)
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    Map.Entry::getValue,
                    (e1, e2) -> e1,
                    LinkedHashMap::new
                ));
            
            analysis.put("wordCloud", topWords);
            
            // Categories based on keywords
            Map<String, Integer> categories = new HashMap<>();
            userNotes.forEach(note -> {
                String text = note.getText().toLowerCase();
                if (text.contains("meeting") || text.contains("call") || text.contains("appointment")) {
                    categories.put("meetings", categories.getOrDefault("meetings", 0) + 1);
                } else if (text.contains("buy") || text.contains("purchase") || text.contains("shop")) {
                    categories.put("shopping", categories.getOrDefault("shopping", 0) + 1);
                } else if (text.contains("project") || text.contains("task") || text.contains("work")) {
                    categories.put("work", categories.getOrDefault("work", 0) + 1);
                } else if (text.contains("personal") || text.contains("home") || text.contains("family")) {
                    categories.put("personal", categories.getOrDefault("personal", 0) + 1);
                }
            });
            analysis.put("categories", categories);
            
            // Productivity insights
            List<String> productivityInsights = new ArrayList<>();
            if (analysis.get("totalNotes") != null && (int) analysis.get("totalNotes") > 0) {
                int total = (int) analysis.get("totalNotes");
                int completed = (int) analysis.get("completedNotes");
                double completionRate = (double) completed / total * 100;
                productivityInsights.add(String.format("Completion rate: %.1f%%", completionRate));
                
                if (!oldNotes.isEmpty()) {
                    productivityInsights.add(String.format("%d notes need attention", oldNotes.size()));
                }
                
                if (total > 10) {
                    productivityInsights.add("High activity: " + total + " total notes");
                }
                
                if (!categories.isEmpty()) {
                    String topCategory = categories.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("unknown");
                    productivityInsights.add("Most active category: " + topCategory);
                }
            }
            analysis.put("productivityInsights", productivityInsights);
            
            // Performance metrics
            long scanTime = System.currentTimeMillis() - startTime;
            analysis.put("scanTime", scanTime);
            analysis.put("scanTimestamp", LocalDateTime.now().toString());
            
            LoggerUtil.logDataScan("completed", userNotes.size(), oldNotes.size(), scanTime);
            LoggerUtil.logPerformance("Data Scan Analysis", scanTime, "Analyzed " + userNotes.size() + " notes");
            LoggerUtil.logAiOperation("DATA_SCAN", "Analysis completed", "Generated " + productivityInsights.size() + " insights");
            
            return analysis;
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logAiError("DATA_SCAN", e, "Failed to scan notes for user: " + username);
            LoggerUtil.logPerformance("Data Scan Analysis", responseTime, "FAILED");
            throw e;
        }
    }

    /**
     * Get old notes that need attention
     */
    public List<Map<String, Object>> getOldNotes(String username, int daysOld) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logAiOperation("GET_OLD_NOTES", "Fetching old notes", "Days: " + daysOld + ", User: " + username);
        
        try {
            List<Note> notes;
            if (username != null) {
                LoggerUtil.logDatabaseOperation("SELECT", "Note", "username", username);
                notes = noteRepository.findByUsername(username);
            } else {
                LoggerUtil.logDatabaseOperation("SELECT", "Note", "all notes");
                notes = noteRepository.findAll();
            }
            
            // Filter old notes (for now, just get incomplete notes)
            List<Map<String, Object>> oldNotes = notes.stream()
                .filter(note -> !note.isDone())
                .map(note -> {
                    Map<String, Object> noteData = new HashMap<>();
                    noteData.put("id", note.getId());
                    noteData.put("text", note.getText());
                    noteData.put("username", note.getUsername());
                    noteData.put("done", note.isDone());
                    noteData.put("isPrivate", note.getIsPrivate());
                    noteData.put("boardType", note.getBoardType());
                    return noteData;
                })
                .collect(Collectors.toList());
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logPerformance("Get Old Notes", responseTime, "Found " + oldNotes.size() + " old notes");
            LoggerUtil.logAiOperation("GET_OLD_NOTES", "Completed", "Returned " + oldNotes.size() + " notes");
            
            return oldNotes;
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logAiError("GET_OLD_NOTES", e, "Failed to get old notes for user: " + username);
            LoggerUtil.logPerformance("Get Old Notes", responseTime, "FAILED");
            throw e;
        }
    }

    /**
     * Generate note suggestions based on existing notes
     */
    public List<String> generateNoteSuggestions(String username) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logAiOperation("GENERATE_SUGGESTIONS", "Generating note suggestions", "User: " + username);
        
        try {
            List<Note> notes;
            if (username != null) {
                LoggerUtil.logDatabaseOperation("SELECT", "Note", "username", username);
                notes = noteRepository.findByUsername(username);
            } else {
                LoggerUtil.logDatabaseOperation("SELECT", "Note", "all notes");
                notes = noteRepository.findByIsPrivateFalse();
            }
            
            List<String> suggestions = new ArrayList<>();
            
            // Generate suggestions based on patterns
            if (notes.isEmpty()) {
                suggestions.add("Start by creating your first note!");
                suggestions.add("Consider setting up daily reminders");
                suggestions.add("Try organizing notes by categories");
            } else {
                int incompleteCount = (int) notes.stream().filter(note -> !note.isDone()).count();
                if (incompleteCount > 5) {
                    suggestions.add("You have " + incompleteCount + " incomplete tasks. Consider prioritizing them.");
                }
                
                if (notes.stream().anyMatch(note -> note.getText().toLowerCase().contains("meeting"))) {
                    suggestions.add("Consider adding meeting follow-up tasks");
                }
                
                suggestions.add("Review and update your notes regularly");
                suggestions.add("Consider breaking down large tasks into smaller ones");
            }
            
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logPerformance("Generate Suggestions", responseTime, "Generated " + suggestions.size() + " suggestions");
            LoggerUtil.logAiOperation("GENERATE_SUGGESTIONS", "Completed", "Suggestions: " + suggestions.size());
            
            return suggestions;
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            LoggerUtil.logAiError("GENERATE_SUGGESTIONS", e, "Failed to generate suggestions for user: " + username);
            LoggerUtil.logPerformance("Generate Suggestions", responseTime, "FAILED");
            throw e;
        }
    }
}
