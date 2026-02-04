import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = (token, userId, currentUsername) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadingRef = useRef(false); // Prevent API call loops
  const connectionRef = useRef(false); // Prevent multiple connections
  const [connectionError, setConnectionError] = useState(null);
  
  const messageCallbackRef = useRef(null);
  const onlineUsersCallbackRef = useRef(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token) {
      console.error('No token provided for WebSocket connection');
      return;
    }

    websocketService.connect(
      token,
      () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected successfully');
      },
      (error) => {
        setIsConnected(false);
        setConnectionError(error.message);
        console.error('WebSocket connection error:', error);
        
        // If it's an authentication error, clear the token and redirect to login
        if (error.message.includes('Authentication failed') || error.message.includes('token expired')) {
          console.log('Authentication failed, clearing token and redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('username');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    );
  }, [token]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setOnlineUsers([]);
  }, []);

  // Send message to specific user
  const sendMessage = useCallback((receiverId, content, messageType = 'DIRECT') => {
    const success = websocketService.sendMessage(receiverId, content, messageType);
    if (!success) {
      console.error('Failed to send message - WebSocket may not be connected');
      // Optionally try to reconnect
      if (!isConnected && token) {
        connect();
      }
    }
    return success;
  }, [isConnected, token, connect]);

  // Send broadcast message
  const broadcastMessage = useCallback((content) => {
    websocketService.broadcastMessage(content);
  }, []);

  // Subscribe to messages
  const subscribeToMessages = useCallback((callback) => {
    if (!userId) return null;
    
    console.log('Setting up message subscription for user:', userId);
    messageCallbackRef.current = callback;
    const subscription = websocketService.subscribeToMessages((message) => {
      console.log('Raw message received via WebSocket:', message);
      setMessages(prev => {
        console.log('Previous messages:', prev);
        console.log('Adding new message:', message);
        const newMessages = [...prev, message];
        console.log('Updated messages list:', newMessages);
        return newMessages;
      });
      if (callback) callback(message);
    }, userId);
    
    console.log('Message subscription set up:', subscription);
    return subscription;
  }, [userId]);

  // Subscribe to online users
  const subscribeToOnlineUsers = useCallback((callback) => {
    onlineUsersCallbackRef.current = callback;
    return websocketService.subscribeToOnlineUsers((users) => {
      setOnlineUsers(users);
      if (callback) callback(users);
    });
  }, []);

  // Subscribe to broadcast messages
  const subscribeToBroadcast = useCallback((callback) => {
    return websocketService.subscribeToBroadcast(callback);
  }, []);

  // Initialize connection
  useEffect(() => {
    // Disconnect if no token or userId
    if (!token || !userId) {
      console.log('No token or userId, disconnecting WebSocket');
      disconnect();
      return;
    }

    // Connect if not already connected
    if (!websocketService.connected) {
      console.log('Initializing WebSocket connection for user:', userId, 'username:', currentUsername);
      connect();
    }
    
    return () => {
      console.log('Cleaning up WebSocket connection for user:', userId);
      disconnect();
    };
  }, [token, userId, currentUsername]); // Add currentUsername to dependencies

  // Set up subscriptions when connected
  useEffect(() => {
    if (isConnected) {
      console.log('WebSocket is connected, setting up real subscriptions');
      
      // Add a small delay to ensure WebSocket connection is stable
      const subscriptionDelay = setTimeout(() => {
        console.log('Setting up subscriptions...');
        const messageSubscription = subscribeToMessages((message) => {
          console.log('Received message via WebSocket:', message);
        });
        const onlineUsersSubscription = subscribeToOnlineUsers((users) => {
          console.log('Received online users update:', users);
          setOnlineUsers(users);
        });
        
        return () => {
          if (messageSubscription) {
            websocketService.unsubscribe('messages_' + userId);
          }
          if (onlineUsersSubscription) {
            websocketService.unsubscribe('online_users');
          }
        };
      }, 500); // Wait 500ms for connection to stabilize
      
      return () => {
        clearTimeout(subscriptionDelay);
      };
    }
  }, [isConnected, userId]);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/unread/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith('<!')) {
          console.warn('Received HTML instead of JSON for unread count - possibly authentication error');
          return;
        }
        const data = JSON.parse(text);
        setUnreadCount(data.count || 0);
      } else {
        console.error('Failed to fetch unread count:', response.status);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  // Fetch initial online users
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/presence/online', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith('<!')) {
          console.warn('Received HTML instead of JSON - possibly authentication error');
          return;
        }
        const users = JSON.parse(text);
        setOnlineUsers(users);
      } else {
        console.error('Failed to fetch online users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, [token]);

  // Load initial data
  useEffect(() => {
    // Only load data when connected and not in a loop
    if (isConnected && !loadingRef.current) {
      loadingRef.current = true;
      
      // Skip API calls for now to avoid the HTML response loop
      // Focus on WebSocket-only functionality
      console.log('WebSocket connected, skipping API calls to avoid loop');
      
      // Reset loading flag after a delay
      setTimeout(() => {
        loadingRef.current = false;
      }, 2000);
    }
  }, [isConnected]);

  // Get conversation with specific user
  const getConversation = useCallback(async (otherUserId) => {
    try {
      const response = await fetch(`/api/messages/conversation/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const conversation = await response.json();
        return conversation;
      }
      return [];
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }
  }, [token]);

  // Get user status
  const getUserStatus = useCallback(async (targetUserId) => {
    try {
      const response = await fetch(`/api/presence/status/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const status = await response.json();
        return status;
      }
      return { isOnline: false, lastSeen: null };
    } catch (error) {
      console.error('Error fetching user status:', error);
      return { isOnline: false, lastSeen: null };
    }
  }, [token]);

  return {
    isConnected,
    onlineUsers,
    messages,
    unreadCount,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    broadcastMessage,
    subscribeToMessages,
    subscribeToOnlineUsers,
    subscribeToBroadcast,
    getConversation,
    getUserStatus,
    fetchUnreadCount,
    fetchOnlineUsers
  };
};
