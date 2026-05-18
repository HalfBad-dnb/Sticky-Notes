import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService.ts';

interface OnlineUser {
  id: number;
  username: string;
  lastSeen: string;
}

interface ChatMessage {
  id?: number;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: string;
  timestamp?: string;
}

interface UserStatus {
  isOnline: boolean;
  lastSeen: string | null;
}

export const useWebSocket = (
  token: string | null,
  userId: string | null,
  currentUsername: string | null
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const messageSubRef = useRef<any>(null);
  const onlineUsersSubRef = useRef<any>(null);

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
      (error: Error) => {
        setIsConnected(false);
        setConnectionError(error.message);
        console.error('WebSocket connection error:', error);

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
  const sendMessage = useCallback((receiverId: string, content: string, messageType = 'DIRECT') => {
    const success = websocketService.sendMessage(receiverId, content, messageType);
    if (!success) {
      console.error('Failed to send message - WebSocket may not be connected');
      if (!isConnected && token) {
        connect();
      }
    }
    return success;
  }, [isConnected, token, connect]);

  // Send broadcast message
  const broadcastMessage = useCallback((content: string) => {
    websocketService.broadcastMessage(content);
  }, []);

  // Subscribe to messages
  const subscribeToMessages = useCallback((callback: (message: ChatMessage) => void) => {
    if (!userId) return null;

    console.log('Setting up message subscription for user:', userId);
    const subscription = websocketService.subscribeToMessages((message: ChatMessage) => {
      console.log('Raw message received via WebSocket:', message);
      setMessages(prev => [...prev, message]);
      if (callback) callback(message);
    }, userId);

    console.log('Message subscription set up:', subscription);
    return subscription;
  }, [userId]);

  // Subscribe to online users
  const subscribeToOnlineUsers = useCallback((callback: (users: OnlineUser[]) => void) => {
    return websocketService.subscribeToOnlineUsers((users: OnlineUser[]) => {
      if (callback) callback(users);
    });
  }, []);

  // Subscribe to broadcast messages
  const subscribeToBroadcast = useCallback((callback: (message: ChatMessage) => void) => {
    return websocketService.subscribeToBroadcast(callback);
  }, []);

  // Initialize connection
  useEffect(() => {
    if (!token || !userId) {
      console.log('No token or userId, disconnecting WebSocket');
      disconnect();
      return;
    }

    if (!websocketService.isConnected()) {
      console.log('Initializing WebSocket connection for user:', userId, 'username:', currentUsername);
      connect();
    }

    return () => {
      console.log('Cleaning up WebSocket connection for user:', userId);
      disconnect();
    };
  }, [token, userId, currentUsername]);

  // Set up subscriptions when connected — properly clean them up on disconnect/unmount
  useEffect(() => {
    if (!isConnected) return;

    console.log('WebSocket is connected, setting up subscriptions');

    const subscriptionDelay = setTimeout(() => {
      console.log('Setting up subscriptions...');
      messageSubRef.current = subscribeToMessages((message: ChatMessage) => {
        console.log('Received message via WebSocket:', message);
      });
      onlineUsersSubRef.current = subscribeToOnlineUsers((users: OnlineUser[]) => {
        console.log('Received online users update:', users);
        setOnlineUsers(users);
      });
    }, 500);

    return () => {
      clearTimeout(subscriptionDelay);
      if (messageSubRef.current) {
        messageSubRef.current.unsubscribe();
        messageSubRef.current = null;
      }
      if (onlineUsersSubRef.current) {
        onlineUsersSubRef.current.unsubscribe();
        onlineUsersSubRef.current = null;
      }
    };
  }, [isConnected, userId]);

  // Load initial data
  useEffect(() => {
    if (isConnected && !loadingRef.current) {
      loadingRef.current = true;
      console.log('WebSocket connected, skipping API calls to avoid loop');
      setTimeout(() => {
        loadingRef.current = false;
      }, 2000);
    }
  }, [isConnected]);

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

  // Get conversation with specific user
  const getConversation = useCallback(async (otherUserId: string) => {
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
  const getUserStatus = useCallback(async (targetUserId: string): Promise<UserStatus> => {
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
