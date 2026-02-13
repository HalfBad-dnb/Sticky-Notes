package com.Sticky_notes.Sticky_notes.controller;

import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.models.UserPresence;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import com.Sticky_notes.Sticky_notes.repository.UserPresenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/presence")
public class UserPresenceController {

    private static final Logger logger = LoggerFactory.getLogger(UserPresenceController.class);

    @Autowired
    private UserPresenceRepository userPresenceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @MessageMapping("/presence.online")
    public void setUserOnline(Map<String, Object> payload, StompHeaderAccessor accessor) {
        try {
            String sessionId = (String) payload.get("sessionId");
            
            // Get user from STOMP session instead of SecurityContext
            Authentication auth = (Authentication) accessor.getUser();
            if (auth == null) {
                logger.error("No authentication found in STOMP session");
                return;
            }
            
            String username = auth.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            logger.info("Setting user {} online with session ID: {}", currentUser.getUsername(), sessionId);

            Optional<UserPresence> existingPresence = userPresenceRepository.findByUserId(currentUser.getId());
            UserPresence presence;

            if (existingPresence.isPresent()) {
                presence = existingPresence.get();
                presence.setIsOnline(true);
                presence.setSessionId(sessionId);
                logger.debug("Updated existing presence for user: {}", currentUser.getUsername());
            } else {
                presence = new UserPresence(currentUser);
                presence.setSessionId(sessionId);
                presence.setIsOnline(true);
                logger.debug("Created new presence for user: {}", currentUser.getUsername());
            }

            userPresenceRepository.save(presence);
            logger.info("Successfully saved online presence for user: {}", currentUser.getUsername());

            // Broadcast updated online users list
            broadcastOnlineUsers();

        } catch (Exception e) {
            logger.error("Error setting user online: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/presence.offline")
    public void setUserOffline(Map<String, Object> payload, StompHeaderAccessor accessor) {
        try {
            String sessionId = (String) payload.get("sessionId");
            
            // Get user from STOMP session instead of SecurityContext
            Authentication auth = (Authentication) accessor.getUser();
            if (auth == null) {
                logger.error("No authentication found in STOMP session for offline");
                return;
            }
            
            String username = auth.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Optional<UserPresence> presenceOpt = userPresenceRepository.findBySessionId(sessionId);
            if (presenceOpt.isPresent()) {
                UserPresence presence = presenceOpt.get();
                presence.setIsOnline(false);
                userPresenceRepository.save(presence);

                logger.info("Set user {} offline with session ID: {}", username, sessionId);

                // Broadcast updated online users list
                broadcastOnlineUsers();
            } else {
                logger.warn("No presence found for session ID: {}", sessionId);
            }

        } catch (Exception e) {
            logger.error("Error setting user offline: {}", e.getMessage(), e);
        }
    }

    @GetMapping("/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlineUsers() {
        try {
            // Clean up stale sessions first (users who haven't been seen in 5 minutes)
            cleanupStaleSessions();
            
            List<UserPresence> onlinePresences = userPresenceRepository.findOnlineUsersOrderByLastSeen();
            List<Map<String, Object>> onlineUsers = onlinePresences.stream()
                    .map(presence -> {
                        Map<String, Object> userInfo = new HashMap<>();
                        userInfo.put("id", presence.getUser().getId());
                        userInfo.put("username", presence.getUser().getUsername());
                        userInfo.put("lastSeen", presence.getLastSeen());
                        return userInfo;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            logger.debug("Retrieved {} online users", onlineUsers.size());
            return ResponseEntity.ok(onlineUsers);
            
        } catch (Exception e) {
            logger.error("Error getting online users: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getOnlineCount() {
        try {
            // Clean up stale sessions first
            cleanupStaleSessions();
            
            long count = userPresenceRepository.countOnlineUsers();
            logger.debug("Current online user count: {}", count);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error getting online count: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    private void cleanupStaleSessions() {
        try {
            // Mark users as offline if they haven't been seen in 5 minutes
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(5);
            List<UserPresence> stalePresences = userPresenceRepository.findStaleSessions(cutoffTime);
            
            for (UserPresence presence : stalePresences) {
                presence.setIsOnline(false);
                logger.debug("Marking stale user {} as offline (last seen: {})", 
                    presence.getUser().getUsername(), presence.getLastSeen());
            }
            
            if (!stalePresences.isEmpty()) {
                userPresenceRepository.saveAll(stalePresences);
                logger.info("Cleaned up {} stale user sessions", stalePresences.size());
                
                // Broadcast updated online users list
                broadcastOnlineUsers();
            }
        } catch (Exception e) {
            logger.error("Error cleaning up stale sessions: {}", e.getMessage(), e);
        }
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable Long userId) {
        try {
            Optional<UserPresence> presenceOpt = userPresenceRepository.findByUserId(userId);
            Map<String, Object> status = new HashMap<>();
            
            if (presenceOpt.isPresent()) {
                UserPresence presence = presenceOpt.get();
                status.put("isOnline", presence.getIsOnline());
                status.put("lastSeen", presence.getLastSeen());
                logger.debug("User {} status: online={}, lastSeen={}", 
                    userId, presence.getIsOnline(), presence.getLastSeen());
            } else {
                status.put("isOnline", false);
                status.put("lastSeen", null);
                logger.debug("User {} status: not found, assuming offline", userId);
            }

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            logger.error("Error getting user status for {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/online/{userId}")
    public ResponseEntity<String> setUserOnlineManually(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            Optional<UserPresence> existingPresence = userPresenceRepository.findByUserId(userId);
            UserPresence presence;

            if (existingPresence.isPresent()) {
                presence = existingPresence.get();
                presence.setIsOnline(true);
                presence.setSessionId("manual_" + System.currentTimeMillis());
                logger.debug("Updated existing presence for user: {}", user.getUsername());
            } else {
                presence = new UserPresence(user);
                presence.setSessionId("manual_" + System.currentTimeMillis());
                presence.setIsOnline(true);
                logger.debug("Created new presence for user: {}", user.getUsername());
            }

            userPresenceRepository.save(presence);
            logger.info("Manually set user {} online", user.getUsername());

            // Broadcast updated online users list
            broadcastOnlineUsers();

            return ResponseEntity.ok("User " + user.getUsername() + " is now online");

        } catch (Exception e) {
            logger.error("Error manually setting user online: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/offline/{userId}")
    public ResponseEntity<String> setUserOfflineManually(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            Optional<UserPresence> presenceOpt = userPresenceRepository.findByUserId(userId);
            if (presenceOpt.isPresent()) {
                UserPresence presence = presenceOpt.get();
                presence.setIsOnline(false);
                userPresenceRepository.save(presence);
                logger.info("Manually set user {} offline", user.getUsername());

                // Broadcast updated online users list
                broadcastOnlineUsers();

                return ResponseEntity.ok("User " + user.getUsername() + " is now offline");
            } else {
                return ResponseEntity.badRequest().body("User " + user.getUsername() + " was not online");
            }

        } catch (Exception e) {
            logger.error("Error manually setting user offline: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    private void broadcastOnlineUsers() {
        try {
            // Get online users directly from repository to avoid recursive call
            List<UserPresence> onlinePresences = userPresenceRepository.findOnlineUsersOrderByLastSeen();
            
            List<Map<String, Object>> onlineUsers = onlinePresences.stream()
                    .map(presence -> {
                        Map<String, Object> userInfo = new HashMap<>();
                        userInfo.put("id", presence.getUser().getId());
                        userInfo.put("username", presence.getUser().getUsername());
                        userInfo.put("lastSeen", presence.getLastSeen());
                        return userInfo;
                    })
                    .toList();
            
            if (onlineUsers != null && !onlineUsers.isEmpty()) {
                messagingTemplate.convertAndSend("/topic/online-users", onlineUsers);
                logger.info("Broadcasted online users update to {} users", onlineUsers.size());
            }
        } catch (Exception e) {
            logger.error("Error broadcasting online users: {}", e.getMessage(), e);
        }
    }
}
