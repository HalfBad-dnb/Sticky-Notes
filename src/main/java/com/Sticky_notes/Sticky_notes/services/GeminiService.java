package com.Sticky_notes.Sticky_notes.services;

import com.Sticky_notes.logging.LoggerUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

/**
 * Gemini AI Service for integrating with Google's Gemini API
 * Provides secure backend integration with comprehensive logging
 */
@Service
public class GeminiService {

    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;

    public GeminiService(@Value("${gemini.api.key:}") String apiKey,
                         @Value("${gemini.model:gemini-2.0-flash}") String model) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        
        LoggerUtil.logSystemEvent("GEMINI_SERVICE_INIT", "Initializing Gemini AI Service");
        LoggerUtil.logInfo("GeminiService", "API Key configured: " + (apiKey != null && !apiKey.trim().isEmpty()));
        LoggerUtil.logInfo("GeminiService", "Model: " + model);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            LoggerUtil.logWarning("GeminiService", "constructor", "Gemini API key not configured");
        } else {
            LoggerUtil.logSystemEvent("GEMINI_SERVICE_INIT_SUCCESS", "Gemini AI Service initialized successfully");
        }
    }

    /**
     * Generate content using Gemini AI
     */
    public CompletableFuture<String> generateContent(String prompt, String systemInstruction) {
        long startTime = System.currentTimeMillis();
        
        LoggerUtil.logAiOperation("GEMINI_REQUEST", "Starting Gemini AI request");
        LoggerUtil.logInfo("GeminiService", "Prompt length: " + prompt.length() + ", Model: " + model);
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            LoggerUtil.logAiError("GEMINI_REQUEST", new RuntimeException("Gemini service not initialized"), 
                "API key not configured");
            return CompletableFuture.failedFuture(new RuntimeException("Gemini API key not configured"));
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", prompt)
                })
            });
            requestBody.put("generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1000
            ));
            
            if (systemInstruction != null) {
                requestBody.put("systemInstruction", Map.of(
                    "parts", new Object[]{
                        Map.of("text", systemInstruction)
                    }
                ));
            }

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .timeout(Duration.ofSeconds(30))
                .build();

            LoggerUtil.logInfo("GeminiService", "Sending request to Gemini API");
            
            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    if (response.statusCode() == 200) {
                        try {
                            JsonNode jsonResponse = objectMapper.readTree(response.body());
                            String text = jsonResponse.path("candidates")
                                .get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text")
                                .asText();
                            
                            LoggerUtil.logAiOperation("GEMINI_SUCCESS", "Gemini AI request completed");
                            LoggerUtil.logInfo("GeminiService", "Response length: " + text.length());
                            
                            return text;
                        } catch (Exception e) {
                            LoggerUtil.logAiError("GEMINI_PARSE_ERROR", e, "Failed to parse Gemini response");
                            throw new RuntimeException("Failed to parse response: " + e.getMessage(), e);
                        }
                    } else {
                        String errorMsg = "HTTP " + response.statusCode() + ": " + response.body();
                        LoggerUtil.logAiError("GEMINI_HTTP_ERROR", new RuntimeException(errorMsg), "HTTP error from Gemini");
                        LoggerUtil.logPerformance("Gemini AI Request", responseTime, "FAILED");
                        throw new RuntimeException(errorMsg);
                    }
                })
                .exceptionally(throwable -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    Exception e = throwable instanceof Exception ? (Exception) throwable : new RuntimeException(throwable.getMessage());
                    LoggerUtil.logAiError("GEMINI_REQUEST", e, "Failed to get response from Gemini");
                    LoggerUtil.logPerformance("Gemini AI Request", responseTime, "FAILED");
                    LoggerUtil.logSecurityEvent("GEMINI_API_ERROR", "Gemini API request failed");
                    throw new RuntimeException("Gemini request failed: " + throwable.getMessage(), throwable);
                });

        } catch (Exception e) {
            LoggerUtil.logAiError("GEMINI_SETUP_ERROR", e, "Failed to setup Gemini request");
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Generate AI-powered note suggestions
     */
    public CompletableFuture<String> generateNoteSuggestions(String userNotes) {
        String prompt = String.format("""
            Based on the following notes, provide 3-5 actionable suggestions for the user:
            
            User Notes:
            %s
            
            Please provide suggestions in a clear, concise format. Focus on:
            1. Task prioritization
            2. Productivity improvements
            3. Organization tips
            4. Follow-up actions needed
            
            Keep suggestions practical and specific.
            """, userNotes);

        String systemInstruction = "You are a helpful productivity assistant that analyzes notes and provides actionable suggestions.";

        LoggerUtil.logAiOperation("GENERATE_SUGGESTIONS", "Generating AI-powered note suggestions");
        LoggerUtil.logInfo("GeminiService", "Notes lines: " + userNotes.split("\n").length);

        return generateContent(prompt, systemInstruction);
    }

    /**
     * Analyze notes and provide insights
     */
    public CompletableFuture<String> analyzeNotes(String notesData) {
        String prompt = String.format("""
            Analyze the following notes data and provide insights:
            
            %s
            
            Please provide:
            1. Overall productivity assessment
            2. Patterns or trends you notice
            3. Areas for improvement
            4. Recommendations for better organization
            
            Be specific and actionable in your analysis.
            """, notesData);

        String systemInstruction = "You are a productivity analyst that helps users understand their note-taking patterns and improve their productivity.";

        LoggerUtil.logAiOperation("ANALYZE_NOTES", "Starting AI-powered notes analysis");
        LoggerUtil.logInfo("GeminiService", "Data size: " + notesData.length());

        return generateContent(prompt, systemInstruction);
    }

    /**
     * Generate a smart response for user queries about their notes
     */
    public CompletableFuture<String> generateSmartResponse(String userQuery, String contextNotes) {
        String prompt = String.format("""
            User Query: %s
            
            Context from user's notes:
            %s
            
            Please provide a helpful, intelligent response based on the user's notes and their query.
            If relevant, suggest specific actions or insights from their notes.
            """, userQuery, contextNotes);

        String systemInstruction = "You are an intelligent assistant that helps users understand and act on their notes. Be helpful, specific, and actionable.";

        LoggerUtil.logAiOperation("SMART_RESPONSE", "Generating AI-powered response");
        LoggerUtil.logInfo("GeminiService", "Query length: " + userQuery.length() + ", Context size: " + contextNotes.length());

        return generateContent(prompt, systemInstruction);
    }

    /**
     * Check if Gemini service is available
     */
    public boolean isAvailable() {
        boolean available = apiKey != null && !apiKey.trim().isEmpty();
        LoggerUtil.logInfo("GeminiService", "Service available: " + available);
        return available;
    }

    /**
     * Get service status
     */
    public Map<String, Object> getStatus() {
        Map<String, Object> status = Map.of(
            "available", isAvailable(),
            "model", model,
            "hasApiKey", apiKey != null && !apiKey.trim().isEmpty(),
            "service", "Gemini AI"
        );

        LoggerUtil.logSystemEvent("GEMINI_STATUS_CHECK", "Gemini service status requested");
        LoggerUtil.logInfo("GeminiService", "Status: " + status);
        return status;
    }
}
