import { useState, useEffect } from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GroupIcon from '@mui/icons-material/Group';
import SyncIcon from '@mui/icons-material/Sync';
import MailIcon from '@mui/icons-material/Mail';

const MessagesPanel = ({ 
  isMessagesOpen, 
  closeMessages, 
  token, 
  userId, 
  currentUsername,
  useWebSocket 
}) => {
  const [messagesTab, setMessagesTab] = useState('all');
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // WebSocket hook
  const {
    isConnected,
    onlineUsers: wsOnlineUsers,
    messages: wsMessages,
    unreadCount,
    connectionError,
    sendMessage,
    getConversation,
    fetchUnreadCount,
    fetchOnlineUsers
  } = useWebSocket(token, userId, currentUsername);
  
  // Update active users from WebSocket
  useEffect(() => {
    if (wsOnlineUsers && wsOnlineUsers.length > 0) {
      setActiveUsers(wsOnlineUsers);
      setOnlineCount(wsOnlineUsers.length);
    }
  }, [wsOnlineUsers]);
  
  // Update real messages from WebSocket
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      // Handle real-time messages
    }
  }, [wsMessages]);
  
  // Fetch conversations when messages tab is active
  useEffect(() => {
    if (isMessagesOpen && messagesTab === 'all' && token) {
      fetchRecentConversations();
    }
  }, [isMessagesOpen, messagesTab, token]);
  
  // Fetch recent conversations
  const fetchRecentConversations = async () => {
    try {
      const response = await fetch('/api/messages/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    }
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    
    // Fetch real conversation history
    try {
      let conversationHistory = [];
      
      if (conv.userId) {
        // Real user conversation
        conversationHistory = await getConversation(conv.userId);
      } else {
        // System conversation - keep hardcoded for now
        conversationHistory = [
          { role: 'system', text: `You are viewing messages from ${conv.title}.`, createdAt: new Date() },
          { role: 'other', text: 'Hello! Let us know if you need anything.', createdAt: new Date() },
        ];
      }
      
      // Format messages for display
      const formattedMessages = conversationHistory.map(msg => ({
        role: msg.sender?.id === userId ? 'user' : 'other',
        text: msg.content,
        sender: msg.sender?.username,
        createdAt: msg.createdAt
      }));
      
      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      // Fallback to hardcoded messages
      setChatMessages([
        { role: 'system', text: `You are viewing messages from ${conv.title}.` },
        { role: 'other', text: 'Hello! Let us know if you need anything.' },
      ]);
    }
  };

  const handleBackFromChat = () => {
    setActiveConversation(null);
    setChatInput('');
    setChatMessages([]);
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text || !activeConversation) return;
    
    // Add message to UI immediately for better UX
    setChatMessages((prev) => [...prev, { role: 'user', text, sender: currentUsername }]);
    
    // Send via WebSocket if it's a real user conversation
    if (activeConversation.userId) {
      const success = sendMessage(activeConversation.userId, text, 'DIRECT');
      if (!success) {
        // Show error message to user
        setChatMessages((prev) => [...prev, { 
          role: 'system', 
          text: 'Message failed to send. Please check your connection and try again.', 
          sender: 'System' 
        }]);
      }
    }
    
    setChatInput('');
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  if (!isMessagesOpen) return null;

  return (
    <div className={`messages-panel ${isMessagesOpen ? 'active' : ''}`}>
      {/* Messages Header */}
      <div className="messages-header">
        {activeConversation && (
          <button
            className="messages-back"
            onClick={handleBackFromChat}
            aria-label="Back to messages list"
          >
            <span className="nav-icon"><ArrowBackIcon /></span>
          </button>
        )}
        <h2 className="messages-title">
          <ChatIcon />
          {activeConversation ? activeConversation.title : 'Messages'}
        </h2>
        <button
          onClick={closeMessages}
          className="messages-close"
          aria-label="Close messages"
        >
          <span className="nav-icon"><CloseIcon /></span>
        </button>
      </div>

      {/* Messages List */}
      <div className={`messages-list ${activeConversation ? 'chat-thread' : ''}`}>
        {activeConversation && (
          <>
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`chat-message ${m.role === 'user' ? 'user' : 'other'}`}
              >
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
          </>
        )}

        {!activeConversation && messagesTab === 'all' && (
          <>
            {conversations.length > 0 ? (
              conversations.map((conv, index) => (
                <div
                  key={`${conv.userId}-${index}`}
                  className={`message-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className="message-header">
                    <span className="message-sender">{conv.username}</span>
                    <span className="message-time">
                      {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="message-content">
                    {conv.lastMessage || 'No messages yet'}
                  </div>
                  <div className="message-preview">
                    {conv.unreadCount > 0 ? `${conv.unreadCount} unread message${conv.unreadCount > 1 ? 's' : ''}` : 'Click to open conversation'}
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Fallback hardcoded messages when no real conversations */}
                <div
                  className="message-item unread"
                  onClick={() => openConversation({ id: 'system-1', title: 'System' })}
                >
                  <div className="message-header">
                    <span className="message-sender">System</span>
                    <span className="message-time">2 min ago</span>
                  </div>
                  <div className="message-content">
                    Welcome to Sticky Notes! Here are some tips to get started.
                  </div>
                  <div className="message-preview">
                    Create your first note by clicking anywhere on the board...
                  </div>
                </div>

                <div
                  className="message-item unread"
                  onClick={() => openConversation({ id: 'team-1', title: 'Team' })}
                >
                  <div className="message-header">
                    <span className="message-sender">Team</span>
                    <span className="message-time">1 hour ago</span>
                  </div>
                  <div className="message-content">
                    New features available!
                  </div>
                  <div className="message-preview">
                    Check out our new collaboration tools and themes...
                  </div>
                </div>

                <div
                  className="message-item unread"
                  onClick={() => openConversation({ id: 'support-1', title: 'Support' })}
                >
                  <div className="message-header">
                    <span className="message-sender">Support</span>
                    <span className="message-time">3 hours ago</span>
                  </div>
                  <div className="message-content">
                    Your subscription is active
                  </div>
                  <div className="message-preview">
                    Thank you for upgrading to our premium plan...
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {!activeConversation && messagesTab === 'ai' && (
          <div className="messages-empty">
            <span className="nav-icon"><SmartToyIcon /></span>
            <div className="messages-empty-text">AI Agent Chat</div>
            <div className="messages-empty-subtext">Start a conversation with your AI assistant.</div>
          </div>
        )}

        {!activeConversation && messagesTab === 'friends' && (
          <div className="messages-content">
            <div className="messages-header">
              <span className="nav-icon"><GroupIcon /></span>
              <div className="messages-title">Active Users</div>
              <div className="messages-count">{onlineCount} online</div>
              <button 
                className="refresh-button"
                onClick={() => {
                  // Force refresh
                  const fetchActiveUsers = async () => {
                    try {
                      const response = await fetch('/api/presence/online', {
                        headers: { 'Content-Type': 'application/json' }
                      });
                      if (response.ok) {
                        const users = await response.json();
                        setActiveUsers(users);
                      }
                    } catch (error) {
                      setActiveUsers([]);
                    }
                  };
                  const fetchOnlineCount = async () => {
                    try {
                      const response = await fetch('/api/presence/count', {
                        headers: { 'Content-Type': 'application/json' }
                      });
                      if (response.ok) {
                        const data = await response.json();
                        setOnlineCount(data.count);
                      }
                    } catch (error) {
                      setOnlineCount(0);
                    }
                  };
                  fetchActiveUsers();
                  fetchOnlineCount();
                }}
                title="Refresh active users"
              >
                <SyncIcon />
              </button>
            </div>
            <div className="active-users-list">
              {activeUsers.length > 0 ? (
                activeUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="active-user-item"
                    onClick={() => openConversation({ userId: user.id, username: user.username, title: user.username })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="user-avatar-small">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info-small">
                      <div className="user-name-small">{user.username}</div>
                      <div className="user-status-online">Online</div>
                    </div>
                    <div className="online-indicator"></div>
                  </div>
                ))
              ) : (
                <div className="messages-empty">
                  <span className="nav-icon"><GroupIcon /></span>
                  <div className="messages-empty-text">
                    {onlineCount === 0 ? 'No active users right now.' : 'No friends online right now.'}
                  </div>
                  <div className="messages-empty-subtext">
                    {onlineCount === 0 ? 'User presence service is unavailable.' : 'Check back later to see who\'s online.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      {activeConversation && (
        <div className="chat-input-container">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button
            onClick={sendChatMessage}
            className="chat-send-button"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      )}

      {!activeConversation && (
        <div className="messages-footer">
          <button
            className={`messages-tab ${messagesTab === 'friends' ? 'active' : ''}`}
            onClick={() => setMessagesTab('friends')}
            aria-label="Active users"
          >
            <span className="nav-icon"><GroupIcon /></span>
            {onlineCount > 0 && <span className="online-count-badge">{onlineCount}</span>}
          </button>
          <button
            className={`messages-tab ${messagesTab === 'ai' ? 'active' : ''}`}
            onClick={() => setMessagesTab('ai')}
            aria-label="AI chat"
          >
            <span className="nav-icon"><SmartToyIcon /></span>
          </button>
          <button
            className={`messages-tab ${messagesTab === 'all' ? 'active' : ''}`}
            onClick={() => setMessagesTab('all')}
            aria-label="All messages"
          >
            <span className="nav-icon"><MailIcon /></span>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          {connectionError && (
            <div className="connection-error-indicator" title={connectionError}>
              ⚠️
            </div>
          )}
        </div>
      )}

      {activeConversation && (
        <div className="chat-input-bar">
          <textarea
            className="chat-textarea"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            rows={1}
          />
          <button className="chat-send" onClick={sendChatMessage} aria-label="Send message">
            <span className="nav-icon"><SendIcon /></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;
