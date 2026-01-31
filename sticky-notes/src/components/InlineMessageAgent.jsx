import React, { useState } from 'react';
import useGeminiAgent from '../hooks/useGeminiAgent';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Send, Clear, SmartToy } from '@mui/icons-material';

const InlineMessageAgent = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const {
    runAgent,
    loading,
    error,
    response,
    clearError,
    clearResponse,
    isApiKeyConfigured
  } = useGeminiAgent();

  const predefinedPrompts = [
    {
      label: 'Jarvis',
      prompt: 'You are Jarvis, a helpful AI assistant. Help me organize my sticky notes and workflow.',
      systemInstruction: 'You are Jarvis, a sophisticated AI assistant specializing in productivity and workflow optimization. Be helpful, efficient, and slightly formal but friendly.'
    },
    {
      label: 'Task Help',
      prompt: 'Help me automate repetitive tasks in my workflow app.',
      systemInstruction: 'You are a workflow automation expert. Focus on practical, step-by-step solutions for automating tasks.'
    },
    {
      label: 'Brainstorm',
      prompt: 'Help me brainstorm ideas for my projects and notes.',
      systemInstruction: 'You are a creative brainstorming partner. Be innovative, encouraging, and provide diverse perspectives.'
    }
  ];

  const handleSendMessage = async (customPrompt = null, systemInstruction = null) => {
    const messageToSend = customPrompt || prompt;
    if (!messageToSend.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);

    try {
      const agentResponse = await runAgent(messageToSend, {
        systemInstruction,
        temperature: 0.7,
        maxTokens: 1000
      });

      const assistantMessage = {
        role: 'assistant',
        content: agentResponse,
        timestamp: new Date().toISOString(),
        model: response?.model || 'gemini-2.0-flash'
      };

      setConversation(prev => [...prev, assistantMessage]);
      setPrompt('');
    } catch (err) {
      console.error('Agent error:', err);
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
    clearResponse();
    clearError();
  };

  if (!isApiKeyConfigured) {
    return (
      <Box p={2} textAlign="center">
        <SmartToy sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          Gemini API Key Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add VITE_GEMINI_API_KEY to your .env file
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2} height="100%" display="flex" flexDirection="column" className="inline-message-agent">
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        <SmartToy sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>AI Assistant</Typography>
        <Button
          size="small"
          onClick={clearConversation}
          disabled={loading || conversation.length === 0}
          startIcon={<Clear />}
          sx={{ 
            ml: 'auto',
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          Clear
        </Button>
      </Box>

      {/* Predefined Prompts */}
      <Box mb={2}>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {predefinedPrompts.map((predefined, index) => (
            <Chip
              key={index}
              label={predefined.label}
              size="small"
              variant="outlined"
              clickable
              onClick={() => handleSendMessage(predefined.prompt, predefined.systemInstruction)}
              disabled={loading}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {/* Conversation History */}
      <Box 
        flex={1} 
        overflow="auto" 
        mb={2}
        maxHeight="300px"
      >
        {conversation.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ask me anything about your workflow, productivity, or sticky notes...
            </Typography>
          </Box>
        ) : (
          conversation.map((message, index) => (
            <Box
              key={index}
              mb={1.5}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                p={1.5}
                maxWidth="85%"
                sx={{
                  bgcolor: message.role === 'user' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                  color: message.role === 'user' ? 'white' : 'white',
                  borderRadius: 2,
                  borderBottomLeftRadius: message.role === 'assistant' ? 0 : 2,
                  borderBottomRightRadius: message.role === 'user' ? 0 : 2,
                  border: message.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  {message.role === 'user' ? 'You' : 'AI'}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                  {message.content}
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.7 }}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Input Area */}
      <Box display="flex" gap={1} alignItems="flex-end">
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
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
          size="small"
          sx={{ minWidth: 'auto', px: 2 }}
        >
          {loading ? <CircularProgress size={16} /> : <Send />}
        </Button>
      </Box>
    </Box>
  );
};

export default InlineMessageAgent;
