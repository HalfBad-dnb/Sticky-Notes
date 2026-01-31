import React, { useState, useEffect } from 'react';
import useGeminiAgent from '../hooks/useGeminiAgent';
import useAIAgentTools from '../hooks/useAIAgentTools';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  Send,
  Clear,
  SmartToy,
  NoteAdd,
  Analytics,
  NotificationImportant,
  Lightbulb,
  Refresh,
  CheckCircle,
  Schedule,
  TrendingUp,
  ArrowBack,
  Close,
  ChatBubbleOutline,
  AttachFile,
  Mic,
  Image,
  Gif
} from '@mui/icons-material';

const EnhancedMessageAgent = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const {
    runAgent,
    loading: aiLoading,
    error: aiError,
    clearError: clearAIError
  } = useGeminiAgent();

  const {
    executeAction,
    loading: toolsLoading,
    error: toolsError,
    clearError: clearToolsError,
    tools
  } = useAIAgentTools();

  const loading = aiLoading || toolsLoading;
  const error = aiError || toolsError;

  // Enhanced system instruction for note management
  const systemInstruction = `You are an intelligent Sticky Notes Assistant with powerful note management capabilities. 

You can help users with:
1. Creating, updating, and organizing notes
2. Analyzing note patterns and productivity
3. Identifying old or neglected notes
4. Providing smart suggestions for better organization
5. Setting up reminders and notifications

When users ask for actions, use the available tools:
- create_note: Create new notes with text, priority, color
- scan_data: Analyze all notes for patterns and insights
- get_old_notes: Find notes that need attention
- get_suggestions: Get smart recommendations
- update_note: Modify existing notes
- delete_note: Remove notes

Always be helpful, proactive, and provide actionable insights about their note-taking habits.`;

  // Load notifications and suggestions on mount
  useEffect(() => {
    loadNotifications();
    loadSuggestions();
  }, []);

  const loadNotifications = async () => {
    try {
      const oldNotes = await tools.getOldNotes(7);
      if (oldNotes.length > 0) {
        setNotifications([
          {
            id: 'old_notes',
            type: 'warning',
            title: 'Old Notes Alert',
            message: `${oldNotes.length} notes are older than 7 days`,
            count: oldNotes.length,
            action: () => handleOldNotes(oldNotes)
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggestionsData = await tools.generateNoteSuggestions();
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const handleOldNotes = (oldNotes) => {
    const notesList = oldNotes.map(note => 
      `- "${note.text}" (${note.daysOld} days old)`
    ).join('\n');
    
    const message = `I found ${oldNotes.length} old notes that need attention:\n\n${notesList}\n\nWould you like me to help you organize, update, or prioritize these notes?`;
    addAssistantMessage(message);
  };

  const addAssistantMessage = (message) => {
    const assistantMessage = {
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'notification'
    };
    setConversation(prev => [...prev, assistantMessage]);
  };

  const handleSendMessage = async (customPrompt = null) => {
    const messageToSend = customPrompt || prompt;
    if (!messageToSend.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);

    try {
      // Check if the message contains action keywords
      const lowerMessage = messageToSend.toLowerCase();
      
      if (lowerMessage.includes('create note') || lowerMessage.includes('add note')) {
        await handleNoteCreation(messageToSend);
      } else if (lowerMessage.includes('scan') || lowerMessage.includes('analyze')) {
        await handleDataScan();
      } else if (lowerMessage.includes('old notes') || lowerMessage.includes('old')) {
        await handleOldNotesRequest();
      } else if (lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
        await handleSuggestions();
      } else {
        // Default to AI response
        await handleAIResponse(messageToSend);
      }
      
      setPrompt('');
    } catch (err) {
      console.error('Error handling message:', err);
    }
  };

  const handleNoteCreation = async (message) => {
    try {
      // Extract note content from message
      const noteMatch = message.match(/create note[:\s]*(.+?)(?:\n|$)/i) || 
                       message.match(/add note[:\s]*(.+?)(?:\n|$)/i);
      
      if (noteMatch) {
        const noteText = noteMatch[1].trim();
        const newNote = await tools.createNote({
          text: noteText,
          priority: 'medium',
          color: '#4caf50'
        });
        
        addAssistantMessage(`✅ Note created successfully: "${noteText}"`);
        await loadNotifications(); // Refresh notifications
      } else {
        addAssistantMessage('I can help you create a note! Please tell me what you want the note to say. For example: "Create note: Buy milk tomorrow"');
      }
    } catch (err) {
      addAssistantMessage(`❌ Error creating note: ${err.message}`);
    }
  };

  const handleDataScan = async () => {
    try {
      addAssistantMessage('🔍 Scanning your notes data...');
      const analysis = await tools.scanNotesData();
      setLastScanTime(new Date());
      
      const report = `
📊 **Notes Analysis Report**

**Overview:**
- Total notes: ${analysis.totalNotes}
- Active notes: ${analysis.activeNotes}
- Completed notes: ${analysis.completedNotes}
- Old notes (>7 days): ${analysis.oldNotes.length}

**Categories:**
${Object.entries(analysis.categories).map(([cat, count]) => `- ${cat}: ${count}`).join('\n') || 'No categories identified'}

**Priority Distribution:**
${Object.entries(analysis.priorityDistribution).map(([priority, count]) => `- ${priority}: ${count}`).join('\n')}

**Productivity Insights:**
${analysis.productivityInsights.map(insight => `• ${insight}`).join('\n')}

**Top Keywords:**
${Object.entries(analysis.wordCloud)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([word, count]) => `- ${word} (${count} times)`)
  .join('\n')}
      `.trim();

      addAssistantMessage(report);
    } catch (err) {
      addAssistantMessage(`❌ Error scanning data: ${err.message}`);
    }
  };

  const handleOldNotesRequest = async () => {
    try {
      const oldNotes = await tools.getOldNotes(7);
      if (oldNotes.length === 0) {
        addAssistantMessage('🎉 Great! You have no notes older than 7 days. Keep up the good work!');
      } else {
        const notesList = oldNotes.map(note => 
          `• "${note.text}" (${note.daysOld} days old)`
        ).join('\n');
        
        addAssistantMessage(`📅 **Old Notes Alert**\n\nFound ${oldNotes.length} notes that need attention:\n\n${notesList}\n\nWould you like me to help you prioritize or update these notes?`);
      }
    } catch (err) {
      addAssistantMessage(`❌ Error fetching old notes: ${err.message}`);
    }
  };

  const handleSuggestions = async () => {
    try {
      const suggestionsData = await tools.generateNoteSuggestions();
      if (suggestionsData.length === 0) {
        addAssistantMessage('👍 Your notes are well organized! No specific suggestions at the moment.');
      } else {
        const suggestionsList = suggestionsData.map((suggestion, index) => 
          `${index + 1}. **${suggestion.title}**\n   ${suggestion.description}`
        ).join('\n\n');
        
        addAssistantMessage(`💡 **Smart Suggestions**\n\n${suggestionsList}\n\nWould you like me to help you implement any of these suggestions?`);
      }
    } catch (err) {
      addAssistantMessage(`❌ Error generating suggestions: ${err.message}`);
    }
  };

  const handleAIResponse = async (message) => {
    try {
      const response = await runAgent(message, {
        systemInstruction,
        temperature: 0.7,
        maxTokens: 1000
      });

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash'
      };

      setConversation(prev => [...prev, assistantMessage]);
    } catch (err) {
      addAssistantMessage(`❌ Error getting AI response: ${err.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setConversation([]);
    clearAIError();
    clearToolsError();
  };

  const quickActions = [
    {
      icon: <NoteAdd />,
      label: 'Create Note',
      action: () => handleSendMessage('Create note: '),
      color: '#4caf50'
    },
    {
      icon: <Analytics />,
      label: 'Scan Data',
      action: () => handleSendMessage('Scan my notes'),
      color: '#2196f3'
    },
    {
      icon: <NotificationImportant />,
      label: 'Old Notes',
      action: () => handleSendMessage('Show old notes'),
      color: '#ff9800'
    },
    {
      icon: <Lightbulb />,
      label: 'Suggestions',
      action: () => handleSendMessage('Give me suggestions'),
      color: '#9c27b0'
    }
  ];

  return (
    <Box 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        p: 0,
        overflow: 'hidden'
      }}
    >
      {/* Header matching the provided image */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <ChatBubbleOutline sx={{ fontSize: 20, color: 'white', mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Messages
          </Typography>
        </Box>
        <IconButton 
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }} 
          onClick={clearConversation} 
          disabled={loading || conversation.length === 0}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {notifications.map((notification) => (
            <Alert
              key={notification.id}
              severity={notification.type}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              sx={{
                mb: 1,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiAlert-message': { color: 'white' },
                '& .MuiAlert-icon': { color: 'white' }
              }}
              action={
                <Button size="small" onClick={notification.action} sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                  View
                </Button>
              }
            >
              {notification.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity="error"
            onClose={() => { clearAIError(); clearToolsError(); }}
            sx={{
              borderRadius: '8px',
              background: 'rgba(211, 47, 47, 0.2)',
              color: 'white',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              '& .MuiAlert-message': { color: 'white' },
              '& .MuiAlert-icon': { color: '#ff6b6b' }
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Conversation History - Always visible */}
      <Box
        flex={1}
        sx={{
          overflow: 'auto',
          mb: 2,
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '2px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px'
          }
        }}
      >
        {conversation.map((message, index) => (
          <Box
            key={index}
            sx={{
              mb: 1.5,
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Box
              sx={{
                maxWidth: '85%',
                p: 1.5,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  display: 'block',
                  mb: 0.5,
                  opacity: 0.9
                }}
              >
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.4,
                  fontSize: '13px'
                }}
              >
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: 'block',
                  opacity: 0.6,
                  fontSize: '10px'
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Icon Actions above input - Horizontal layout */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 1,
          px: 1
        }}
      >
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onClick={() => handleSendMessage('Create note: ')}
        >
          <NoteAdd fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onClick={() => handleSendMessage('Scan my notes')}
        >
          <Analytics fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <AttachFile fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Image fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Gif fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Mic fontSize="small" />
        </IconButton>
      </Box>

      {/* Input Area - matching messages style */}
      <Box display="flex" gap={1} alignItems="flex-end">
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your notes..."
          disabled={loading}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.5)',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSendMessage()}
          disabled={loading || !prompt.trim()}
          sx={{
            minWidth: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(102, 126, 234, 0.8)',
            '&:hover': {
              background: 'rgba(102, 126, 234, 1)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: 'white' }} />
          ) : (
            <Send sx={{ fontSize: 18, color: 'white' }} />
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default EnhancedMessageAgent;
