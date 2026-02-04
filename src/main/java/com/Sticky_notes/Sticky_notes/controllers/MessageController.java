package com.Sticky_notes.Sticky_notes.controllers;

import com.Sticky_notes.Sticky_notes.models.Message;
import com.Sticky_notes.Sticky_notes.models.User;
import com.Sticky_notes.Sticky_notes.repository.MessageRepository;
import com.Sticky_notes.Sticky_notes.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("No authentication found in SecurityContext");
            throw new RuntimeException("User not authenticated");
        }
        
        String username = authentication.getName();
        if (username == null || username.equals("anonymousUser")) {
            logger.error("Invalid username in authentication: {}", username);
            throw new RuntimeException("Invalid user authentication");
        }
        
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private User getCurrentUser(StompHeaderAccessor accessor) {
        // First try to get from SecurityContext
        try {
            return getCurrentUser();
        } catch (Exception e) {
            logger.debug("SecurityContext not available, trying session attributes");
        }
        
        // Fallback to session attributes
        if (accessor != null && accessor.getSessionAttributes() != null) {
            String username = (String) accessor.getSessionAttributes().get("username");
            if (username != null) {
                logger.info("Found username in session attributes: {}", username);
                return userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found: " + username));
            }
        }
        
        // Fallback to accessor user
        if (accessor != null && accessor.getUser() != null) {
            String username = accessor.getUser().getName();
            if (username != null) {
                logger.info("Found username in accessor user: {}", username);
                return userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found: " + username));
            }
        }
        
        logger.error("No user found in any authentication source");
        throw new RuntimeException("User not authenticated");
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> messagePayload, StompHeaderAccessor accessor) {
        logger.info("Received sendMessage request: {}", messagePayload);
        logger.info("StompHeaderAccessor: {}", accessor);
        
        try {
            String content = (String) messagePayload.get("content");
            Long receiverId = Long.parseLong(messagePayload.get("receiverId").toString());
            String messageType = (String) messagePayload.getOrDefault("messageType", "DIRECT");

            logger.info("Extracted - content: {}, receiverId: {}, messageType: {}", content, receiverId, messageType);

            User sender = getCurrentUser(accessor);
            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));

            logger.info("Sending message from {} to {}: {}", sender.getUsername(), receiver.getUsername(), content);

            Message message = new Message(sender, receiver, content, messageType);
            message = messageRepository.save(message);

            logger.debug("Saved message with ID: {}", message.getId());

            // Create a simple message DTO for WebSocket transmission
            java.util.Map<String, Object> messageDto = new java.util.HashMap<>();
            messageDto.put("id", message.getId());
            messageDto.put("content", message.getContent());
            messageDto.put("createdAt", message.getCreatedAt());
            messageDto.put("messageType", message.getMessageType());
            messageDto.put("isRead", message.getIsRead());
            
            // Add sender info
            java.util.Map<String, Object> senderDto = new java.util.HashMap<>();
            senderDto.put("id", sender.getId());
            senderDto.put("username", sender.getUsername());
            messageDto.put("sender", senderDto);
            
            // Add receiver info
            java.util.Map<String, Object> receiverDto = new java.util.HashMap<>();
            receiverDto.put("id", receiver.getId());
            receiverDto.put("username", receiver.getUsername());
            messageDto.put("receiver", receiverDto);

            // Send to specific user
            logger.info("Sending message to receiver {} at /queue/messages", receiverId);
            String receiverDestination = "/user/" + receiverId + "/queue/messages";
            logger.info("Full receiver destination: {}", receiverDestination);
            
            try {
                messagingTemplate.convertAndSend(
                        receiverDestination,
                        messageDto
                );
                logger.info("Message sent to receiver's queue");
            } catch (Exception e) {
                logger.error("Error sending to receiver: {}", e.getMessage(), e);
            }

            // Send confirmation to sender
            logger.info("Sending confirmation to sender {} at /queue/messages", sender.getId());
            String senderDestination = "/user/" + sender.getId() + "/queue/messages";
            logger.info("Full sender destination: {}", senderDestination);
            
            try {
                messagingTemplate.convertAndSend(
                        senderDestination,
                        messageDto
                );
                logger.info("Confirmation sent to sender's queue");
            } catch (Exception e) {
                logger.error("Error sending to sender: {}", e.getMessage(), e);
            }

            logger.info("Message sent successfully from {} to {}", sender.getUsername(), receiver.getUsername());

        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/chat.broadcast")
    public Message broadcastMessage(@Payload Map<String, Object> messagePayload) {
        try {
            String content = (String) messagePayload.get("content");
            User sender = getCurrentUser();

            logger.info("Broadcasting message from {}: {}", sender.getUsername(), content);

            Message message = new Message(sender, null, content, "BROADCAST");
            Message savedMessage = messageRepository.save(message);

            // Send broadcast to all users
            messagingTemplate.convertAndSend("/topic/broadcast", savedMessage);

            logger.info("Broadcast message saved with ID: {}", savedMessage.getId());
            return savedMessage;

        } catch (Exception e) {
            logger.error("Error broadcasting message: {}", e.getMessage(), e);
            return null;
        }
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable Long userId) {
        try {
            User currentUser = getCurrentUser();
            User otherUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            logger.debug("Fetching conversation between {} and {}", currentUser.getUsername(), otherUser.getUsername());

            // Simple implementation - get all messages and filter
            List<Message> allMessages = messageRepository.findAll();
            List<Message> conversation = allMessages.stream()
                    .filter(m -> (m.getSender().getId().equals(currentUser.getId()) && m.getReceiver().getId().equals(otherUser.getId())) ||
                            (m.getSender().getId().equals(otherUser.getId()) && m.getReceiver().getId().equals(currentUser.getId())))
                    .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                    .toList();
            
            logger.debug("Found {} messages in conversation", conversation.size());
            return ResponseEntity.ok(conversation);

        } catch (Exception e) {
            logger.error("Error getting conversation for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount() {
        try {
            User currentUser = getCurrentUser();
            // Simple implementation - get all messages and filter
            List<Message> allMessages = messageRepository.findAll();
            List<Message> unreadMessages = allMessages.stream()
                    .filter(m -> m.getReceiver().getId().equals(currentUser.getId()) && !m.getIsRead())
                    .toList();
            
            Map<String, Integer> response = Map.of("count", unreadMessages.size());
            logger.debug("User {} has {} unread messages", currentUser.getUsername(), unreadMessages.size());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting unread count: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/mark-read/{messageId}")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        try {
            User currentUser = getCurrentUser();
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            if (message.getReceiver().getId().equals(currentUser.getId())) {
                message.setIsRead(true);
                messageRepository.save(message);

                logger.info("Marked message {} as read by user {}", messageId, currentUser.getUsername());
                return ResponseEntity.ok().build();
            } else {
                logger.warn("User {} attempted to mark message {} as read, but is not the receiver", 
                    currentUser.getUsername(), messageId);
                return ResponseEntity.badRequest().build();
            }

        } catch (Exception e) {
            logger.error("Error marking message {} as read: {}", messageId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentConversations() {
        try {
            User currentUser = getCurrentUser();
            List<Message> recentMessages = messageRepository.findAll();
            
            List<Map<String, Object>> conversations = recentMessages.stream()
                    .map(message -> {
                        Map<String, Object> conv = new java.util.HashMap<>();
                        User otherUser = message.getSender().getId().equals(currentUser.getId()) 
                                ? message.getReceiver() 
                                : message.getSender();
                        
                        conv.put("userId", otherUser.getId());
                        conv.put("username", otherUser.getUsername());
                        conv.put("lastMessage", message.getContent());
                        conv.put("lastMessageTime", message.getCreatedAt());
                        conv.put("unreadCount", messageRepository.findAll().stream()
                                .filter(m -> m.getReceiver().getId().equals(currentUser.getId()) && !m.getIsRead())
                                .toList().size());
                        return conv;
                    })
                    .collect(Collectors.toList());

            logger.debug("Retrieved {} recent conversations for user {}", conversations.size(), currentUser.getUsername());
            return ResponseEntity.ok(conversations);

        } catch (Exception e) {
            logger.error("Error getting recent conversations: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
