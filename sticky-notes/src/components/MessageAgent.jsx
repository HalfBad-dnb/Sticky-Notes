import React, { useState } from 'react';
import useGeminiAgent from '../hooks/useGeminiAgent';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { Send, SmartToy, Clear } from '@mui/icons-material';

const MessageAgent = () => {
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
      label: 'Jarvis Assistant',
      prompt: 'You are Jarvis, a helpful AI assistant. Help me organize my sticky notes and workflow.',
      systemInstruction: 'You are Jarvis, a sophisticated AI assistant specializing in productivity and workflow optimization. Be helpful, efficient, and slightly formal but friendly.'
    },
    {
      label: 'Task Automation',
      prompt: 'Help me automate repetitive tasks in my workflow app.',
      systemInstruction: 'You are a workflow automation expert. Focus on practical, step-by-step solutions for automating tasks.'
    },
    {
      label: 'Creative Brainstorming',
      prompt: 'Help me brainstorm ideas for my projects and notes.',
      systemInstruction: 'You are a creative brainstorming partner. Be innovative, encouraging, and provide diverse perspectives.'
    },
    {
      label: 'Productivity Coach',
      prompt: 'Help me improve my productivity and time management.',
      systemInstruction: 'You are a productivity coach. Provide actionable advice, strategies, and motivation for better time management.'
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
        maxTokens: 1500
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

  const handlePredefinedPrompt = (predefined) => {
    handleSendMessage(predefined.prompt, predefined.systemInstruction);
  };

  if (!isApiKeyConfigured) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <SmartToy sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Gemini API Key Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To use the Message Agent, you need to configure your Gemini API key.
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'left' }}>
            <Typography variant="body2" component="pre">
              {`# Add to your .env file:
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Or in your environment:
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here`}
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Get your API key from{' '}
            <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <SmartToy sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            Message AI Agent
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Powered by Google Gemini 2.0 Flash - Your intelligent assistant for productivity and workflow automation.
        </Typography>

        {/* Predefined Prompts */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Quick Start Prompts
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {predefinedPrompts.map((predefined, index) => (
              <Chip
                key={index}
                label={predefined.label}
                variant="outlined"
                clickable
                onClick={() => handlePredefinedPrompt(predefined)}
                disabled={loading}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error Display */}
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Conversation History */}
        {conversation.length > 0 && (
          <Box mb={3} maxHeight="400px" overflow="auto">
            {conversation.map((message, index) => (
              <Box
                key={index}
                mb={2}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                    color: message.role === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {message.role === 'user' ? 'You' : 'AI Agent'}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                    {message.model && ` • ${message.model}`}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        )}

        {/* Input Area */}
        <Box display="flex" gap={2} alignItems="flex-start">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your workflow, productivity, or sticky notes..."
            disabled={loading}
            variant="outlined"
          />
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant="contained"
              onClick={() => handleSendMessage()}
              disabled={loading || !prompt.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              sx={{ minWidth: '100px' }}
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
            <Button
              variant="outlined"
              onClick={clearConversation}
              disabled={loading || conversation.length === 0}
              startIcon={<Clear />}
              sx={{ minWidth: '100px' }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* API Info */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            Powered by Google Gemini 2.0 Flash • Responses may take a few seconds • Free tier compatible
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MessageAgent;
