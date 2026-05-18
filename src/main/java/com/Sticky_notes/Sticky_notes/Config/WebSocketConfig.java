package com.Sticky_notes.Sticky_notes.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.Sticky_notes.Sticky_notes.security.JwtTokenProvider;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = 
                    MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && accessor.getCommand() != null) {
                    String commandName = accessor.getCommand().name();
                    logger.debug("Processing STOMP command: {}", commandName);
                    
                    if (accessor.getDestination() != null) {
                        logger.debug("Message destination: {}", accessor.getDestination());
                    }
                    
                    if ("CONNECT".equals(commandName)) {
                        // Get token from headers
                        List<String> authHeaders = accessor.getNativeHeader("Authorization");
                        if (authHeaders != null && !authHeaders.isEmpty()) {
                            String authToken = authHeaders.get(0);
                            if (authToken.startsWith("Bearer ")) {
                                authToken = authToken.substring(7);
                            }
                            
                            // Validate JWT token and get username
                            String username = getUsernameFromToken(authToken);
                            if (username != null) {
                                // Create authentication object
                                Authentication auth = new UsernamePasswordAuthenticationToken(
                                    username, null, java.util.Collections.emptyList());
                                    
                                // Set authentication in both the accessor and SecurityContext
                                accessor.setUser(auth);
                                
                                // Also set in a thread-local context for message handlers
                                SecurityContextHolder.getContext().setAuthentication(auth);
                                
                                // Store username in session attributes for easy access
                                accessor.getSessionAttributes().put("username", username);
                                
                                logger.info("WebSocket authenticated for user: {}", username);
                            }
                        }
                    } else if ("SEND".equals(commandName) || "SUBSCRIBE".equals(commandName)) {
                        // For SEND and SUBSCRIBE messages, ensure SecurityContext is set from session user
                        if (accessor.getUser() != null) {
                            Authentication userAuth = new UsernamePasswordAuthenticationToken(
                                accessor.getUser().getName(), null, java.util.Collections.emptyList());
                            SecurityContextHolder.getContext().setAuthentication(userAuth);
                            
                            // Also ensure username is in session attributes
                            if (accessor.getSessionAttributes() != null && !accessor.getSessionAttributes().containsKey("username")) {
                                accessor.getSessionAttributes().put("username", accessor.getUser().getName());
                            }
                            
                            logger.debug("SecurityContext set for {} command, user: {}", 
                                commandName, accessor.getUser().getName());
                        } else {
                            logger.warn("No user found in session for {} command", commandName);
                        }
                    }
                }
                
                return message;
            }
        });
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(4 * 8192);
        registration.setSendBufferSizeLimit(3 * 512 * 1024);
        registration.setSendTimeLimit(20 * 10000);
    }

    private String getUsernameFromToken(String token) {
        try {
            return tokenProvider.getUsernameFromToken(token);
        } catch (Exception e) {
            System.err.println("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }
}
