package com.Sticky_notes.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralized logging utility for Sticky Notes application
 * Provides structured logging with context information
 */
public class LoggerUtil {
    
    // Create loggers for different components
    public static final Logger SECURITY_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.security");
    public static final Logger CONTROLLER_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.controllers");
    public static final Logger SERVICE_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.services");
    public static final Logger REPOSITORY_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.repositories");
    public static final Logger AI_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.ai");
    public static final Logger PERFORMANCE_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.performance");
    public static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("com.Sticky_notes.audit");
    
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Get current user information
     */
    public static String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "anonymous";
    }
    
    /**
     * Get current request information
     */
    public static Map<String, String> getRequestInfo() {
        Map<String, String> requestInfo = new HashMap<>();
        
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                requestInfo.put("method", request.getMethod());
                requestInfo.put("uri", request.getRequestURI());
                requestInfo.put("remoteAddr", request.getRemoteAddr());
                requestInfo.put("userAgent", request.getHeader("User-Agent"));
                
                // Log headers (excluding sensitive ones)
                Enumeration<String> headerNames = request.getHeaderNames();
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    if (!isSensitiveHeader(headerName)) {
                        requestInfo.put("header." + headerName, request.getHeader(headerName));
                    }
                }
            }
        } catch (Exception e) {
            requestInfo.put("error", "Failed to get request info: " + e.getMessage());
        }
        
        return requestInfo;
    }
    
    /**
     * Check if header contains sensitive information
     */
    private static boolean isSensitiveHeader(String headerName) {
        String lowerName = headerName.toLowerCase();
        return lowerName.contains("authorization") || 
               lowerName.contains("token") || 
               lowerName.contains("password") ||
               lowerName.contains("secret") ||
               lowerName.contains("key");
    }
    
    /**
     * Log security events
     */
    public static void logSecurityEvent(String event, String details, Object... args) {
        String message = String.format("[%s] %s - %s", 
            getCurrentUser(), event, String.format(details, args));
        
        SECURITY_LOGGER.info(message);
        AUDIT_LOGGER.info(message);
    }
    
    /**
     * Log security events with request context
     */
    public static void logSecurityEvent(String event, String details, Map<String, String> requestContext) {
        String message = String.format("[%s] %s - %s", getCurrentUser(), event, details);
        
        SECURITY_LOGGER.info(message + " | Request: " + requestContext);
        AUDIT_LOGGER.info(message + " | Request: " + requestContext);
    }
    
    /**
     * Log API requests
     */
    public static void logApiRequest(String method, String endpoint, Object body) {
        String message = String.format("[%s] API Request: %s %s", getCurrentUser(), method, endpoint);
        
        if (body != null) {
            CONTROLLER_LOGGER.debug(message + " | Body: {}", body);
        } else {
            CONTROLLER_LOGGER.debug(message);
        }
        
        PERFORMANCE_LOGGER.info(message);
    }
    
    /**
     * Log API responses
     */
    public static void logApiResponse(String method, String endpoint, int status, long responseTime) {
        String message = String.format("[%s] API Response: %s %s - Status: %d (%dms)", 
            getCurrentUser(), method, endpoint, status, responseTime);
        
        CONTROLLER_LOGGER.info(message);
        PERFORMANCE_LOGGER.info(message);
    }
    
    /**
     * Log database operations
     */
    public static void logDatabaseOperation(String operation, String entity, Object... params) {
        String message = String.format("[%s] DB Operation: %s on %s", 
            getCurrentUser(), operation, entity);
        
        if (params.length > 0) {
            REPOSITORY_LOGGER.debug(message + " | Params: {}", (Object) params);
        } else {
            REPOSITORY_LOGGER.debug(message);
        }
    }
    
    /**
     * Log service operations
     */
    public static void logServiceOperation(String operation, String details, Object... params) {
        String message = String.format("[%s] Service: %s - %s", 
            getCurrentUser(), operation, details);
        
        if (params.length > 0) {
            SERVICE_LOGGER.debug(message + " | Params: {}", (Object) params);
        } else {
            SERVICE_LOGGER.debug(message);
        }
    }
    
    /**
     * Log AI agent operations
     */
    public static void logAiOperation(String operation, String details, Object... params) {
        String message = String.format("[%s] AI Agent: %s - %s", 
            getCurrentUser(), operation, details);
        
        if (params.length > 0) {
            AI_LOGGER.info(message + " | Params: {}", (Object) params);
        } else {
            AI_LOGGER.info(message);
        }
    }
    
    /**
     * Log AI agent errors
     */
    public static void logAiError(String operation, Exception error, String context) {
        String message = String.format("[%s] AI Agent Error: %s - %s", 
            getCurrentUser(), operation, error.getMessage());
        
        AI_LOGGER.error(message + " | Context: " + context, error);
        SECURITY_LOGGER.warn("AI Agent error occurred", error);
    }
    
    /**
     * Log performance metrics
     */
    public static void logPerformance(String operation, long duration, String details) {
        String message = String.format("[%s] Performance: %s completed in %dms - %s", 
            getCurrentUser(), operation, duration, details);
        
        PERFORMANCE_LOGGER.info(message);
    }
    
    /**
     * Log performance metrics with threshold warning
     */
    public static void logPerformance(String operation, long duration, String details, long warningThreshold) {
        String message = String.format("[%s] Performance: %s completed in %dms - %s", 
            getCurrentUser(), operation, duration, details);
        
        if (duration > warningThreshold) {
            PERFORMANCE_LOGGER.warn(message + " | SLOW OPERATION - Threshold: " + warningThreshold + "ms");
        } else {
            PERFORMANCE_LOGGER.info(message);
        }
    }
    
    /**
     * Log note operations
     */
    public static void logNoteOperation(String operation, Long noteId, String details) {
        String message = String.format("[%s] Note %s: ID=%d - %s", 
            getCurrentUser(), operation, noteId, details);
        
        SERVICE_LOGGER.info(message);
        AUDIT_LOGGER.info(message);
    }
    
    /**
     * Log data scan operations
     */
    public static void logDataScan(String operation, int totalNotes, int oldNotes, long scanTime) {
        String message = String.format("[%s] Data Scan %s: Total=%d, Old=%d, Time=%dms", 
            getCurrentUser(), operation, totalNotes, oldNotes, scanTime);
        
        AI_LOGGER.info(message);
        PERFORMANCE_LOGGER.info(message);
    }
    
    /**
     * Log authentication events
     */
    public static void logAuthEvent(String event, String username, boolean success) {
        String message = String.format("Auth Event: %s - User: %s - Success: %s", 
            event, username, success);
        
        SECURITY_LOGGER.info(message);
        AUDIT_LOGGER.info(message);
    }
    
    /**
     * Log authentication events with IP
     */
    public static void logAuthEvent(String event, String username, boolean success, String ipAddress) {
        String message = String.format("Auth Event: %s - User: %s - Success: %s - IP: %s", 
            event, username, success, ipAddress);
        
        SECURITY_LOGGER.info(message);
        AUDIT_LOGGER.info(message);
    }
    
    /**
     * Log system events
     */
    public static void logSystemEvent(String event, String details) {
        String message = String.format("System Event: %s - %s", event, details);
        
        LoggerFactory.getLogger("com.Sticky_notes.system").info(message);
    }
    
    /**
     * Log system events with timestamp
     */
    public static void logSystemEvent(String event, String details, LocalDateTime timestamp) {
        String message = String.format("System Event: %s - %s at %s", 
            event, details, timestamp.format(TIMESTAMP_FORMATTER));
        
        LoggerFactory.getLogger("com.Sticky_notes.system").info(message);
    }
    
    /**
     * Log error with context
     */
    public static void logError(String component, String operation, Exception error, String context) {
        String message = String.format("[%s] Error in %s.%s: %s - Context: %s", 
            getCurrentUser(), component, operation, error.getMessage(), context);
        
        LoggerFactory.getLogger("com.Sticky_notes." + component).error(message, error);
    }
    
    /**
     * Log warning with context
     */
    public static void logWarning(String component, String operation, String message, Object... params) {
        String formattedMessage = String.format("[%s] Warning in %s.%s: %s", 
            getCurrentUser(), component, operation, message);
        
        if (params.length > 0) {
            LoggerFactory.getLogger("com.Sticky_notes." + component).warn(formattedMessage + " | Params: {}", (Object) params);
        } else {
            LoggerFactory.getLogger("com.Sticky_notes." + component).warn(formattedMessage);
        }
    }
    
    /**
     * Log info message
     */
    public static void logInfo(String component, String message, Object... params) {
        String formattedMessage = String.format("[%s] %s", getCurrentUser(), message);
        
        if (params.length > 0) {
            LoggerFactory.getLogger("com.Sticky_notes." + component).info(formattedMessage + " | Params: {}", (Object) params);
        } else {
            LoggerFactory.getLogger("com.Sticky_notes." + component).info(formattedMessage);
        }
    }
}
