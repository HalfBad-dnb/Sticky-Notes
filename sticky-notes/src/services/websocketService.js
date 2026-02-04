import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.sessionId = null;
    this.subscriptions = new Map();
    this.connectionPromise = null; // Prevent multiple connection attempts
  }

  connect(token, onConnect, onError) {
    // If already connecting, return the existing promise
    if (this.connectionPromise) {
      console.log('Connection already in progress, returning existing promise');
      return this.connectionPromise;
    }

    // If already connected, just call the callback
    if (this.client && this.client.connected) {
      console.log('Already connected, calling onConnect callback');
      if (onConnect) onConnect();
      return Promise.resolve();
    }

    console.log('Attempting to connect to WebSocket with token:', token ? 'present' : 'missing');
    
    this.connectionPromise = new Promise((resolve, reject) => {
      // Use the correct WebSocket URL for the backend with SockJS
      const wsUrl = 'ws://localhost:8081/ws';
      console.log('Connecting to WebSocket URL:', wsUrl);
      
      this.client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: function (str) {
          console.log('STOMP Debug:', str);
          // Check if this is a MESSAGE frame
          if (str.includes('MESSAGE')) {
            console.log(' ANY MESSAGE FRAME:', str);
          }
          if (str.includes('MESSAGE') && str.includes('destination:/user/')) {
            console.log(' FOUND MESSAGE FRAME FOR USER:', str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => {
          return new SockJS('http://localhost:8081/ws');
        }
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        console.log('Connected headers:', frame.headers);
        this.connected = true;
        this.sessionId = this.generateSessionId();
        this.connectionPromise = null; // Clear the promise
        
        // Set user online
        console.log('Setting user online with session ID:', this.sessionId);
        try {
          this.client.publish({
            destination: '/app/presence.online',
            body: JSON.stringify({ sessionId: this.sessionId })
          });
        } catch (error) {
          console.error('Error setting user online:', error);
        }
        
        if (onConnect) onConnect();
        resolve();
      };

      this.client.onDisconnect = (frame) => {
        console.log('Disconnected from WebSocket:', frame);
        this.connected = false;
        this.connectionPromise = null; // Clear the promise
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        console.error('Error details:', frame.headers['message']);
        this.connectionPromise = null; // Clear the promise
        
        // Check if it's an authentication error
        const errorMessage = frame.headers['message'] || '';
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('expired')) {
          console.error('Authentication error - token may be expired');
          if (onError) {
            onError(new Error('Authentication failed - token expired'));
          }
        }
        
        reject(new Error('STOMP connection error: ' + errorMessage));
      };

      this.client.activate();
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.client && this.connected) {
      this.setUserOffline();
      this.client.deactivate();
      this.connected = false;
    }
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  setUserOnline() {
    if (this.connected && this.sessionId) {
      console.log('Publishing to /app/presence.online with session ID:', this.sessionId);
      this.client.publish({
        destination: '/app/presence.online',
        body: JSON.stringify({ sessionId: this.sessionId })
      });
    } else {
      console.error('Cannot set user online - not connected or no session ID');
    }
  }

  setUserOffline() {
    if (this.client && this.sessionId) {
      this.client.publish({
        destination: '/app/presence.offline',
        body: JSON.stringify({ sessionId: this.sessionId })
      });
    }
  }

  sendMessage(receiverId, content, messageType = 'DIRECT') {
    if (!this.connected) {
      console.error('WebSocket not connected - cannot send message');
      return false;
    }

    console.log('Sending message:', { receiverId, content, messageType });

    const message = {
      receiverId,
      content,
      messageType
    };

    console.log('Message payload:', JSON.stringify(message));

    try {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      });
      console.log('Message published to /app/chat.sendMessage');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  broadcastMessage(content) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.broadcast',
      body: JSON.stringify({ content })
    });
  }

  subscribeToMessages(callback, userId) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    console.log('Attempting to subscribe to messages for user:', userId);
    
    const subscription = this.client.subscribe(`/user/${userId}/queue/messages`, (message) => {
      console.log('Raw STOMP message received:', message);
      console.log('Message body:', message.body);
      console.log('Message headers:', message.headers);
      
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log('Parsed message:', parsedMessage);
        console.log('Received message:', parsedMessage);
        if (callback) callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error, 'Raw body:', message.body);
      }
    });

    console.log('Successfully subscribed to messages for user:', userId);
    return subscription;
  }

  subscribeToOnlineUsers(callback) {
    console.log('Attempting to subscribe to online users');
    
    // Don't check connection state - let STOMP handle it
    const subscription = this.client.subscribe('/topic/online-users', (message) => {
      try {
        console.log('Received online users update:', message.body);
        const users = JSON.parse(message.body);
        callback(users);
      } catch (error) {
        console.error('Error parsing online users:', error);
      }
    });

    this.subscriptions.set('online_users', subscription);
    console.log('Successfully subscribed to online users');
    return subscription;
  }

  subscribeToBroadcast(callback) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe('/user/topic/broadcast', (message) => {
      try {
        const broadcastData = JSON.parse(message.body);
        callback(broadcastData);
      } catch (error) {
        console.error('Error parsing broadcast:', error);
      }
    });

    this.subscriptions.set('broadcast', subscription);
    return subscription;
  }

  unsubscribe(subscriptionKey) {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  isConnected() {
    return this.connected;
  }

  getSessionId() {
    return this.sessionId;
  }
}

export default new WebSocketService();
