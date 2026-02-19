import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Button,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as AIIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';
import { colors } from '../../styles/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
  protocolId?: string;
  currentSection?: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  open,
  onClose,
  protocolId,
  currentSection
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const context = currentSection 
        ? `Currently working on Section ${currentSection} of protocol ${protocolId}`
        : protocolId 
        ? `Working on protocol ${protocolId}`
        : undefined;

      const response = await aiService.getSectionAssistance(
        currentSection || 'general',
        {},
        input,
        { protocolId, context }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleClear = () => {
    if (confirm('Clear conversation history?')) {
      setMessages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          background: `linear-gradient(135deg, ${colors.background.paper} 0%, ${alpha(colors.primary.light, 0.05)} 100%)`,
          transition: isResizing ? 'none' : 'width 0.3s ease'
        }
      }}
      PaperProps={{
        ref: drawerRef
      }}
    >
      {/* Resize Handle */}
      <Box
        onMouseDown={() => setIsResizing(true)}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'ew-resize',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: alpha(colors.primary.main, 0.1)
          },
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <DragIcon sx={{ fontSize: 16, color: colors.text.disabled, opacity: 0.5 }} />
      </Box>

      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AIIcon fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              AI Assistant
            </Typography>
            <Typography variant="caption">
              Ask anything about clinical trial protocols
            </Typography>
          </Box>
        </Box>
        <Box>
          {messages.length > 0 && (
            <Tooltip title="Clear conversation">
              <IconButton onClick={handleClear} sx={{ color: 'white', mr: 1 }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.length === 0 && (
          <Box textAlign="center" py={8}>
            <AIIcon sx={{ fontSize: 80, color: colors.primary.light, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Welcome to AI Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Ask questions about ICH M11, protocol requirements, or get help with section content.
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} maxWidth={400} mx="auto">
              {[
                'What is required in Section 3?',
                'How should I structure trial objectives?',
                'What are ICH M11 requirements for eligibility criteria?'
              ].map((example, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => setInput(example)}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {example}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '85%',
                background: message.role === 'user'
                  ? `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
                  : colors.background.paper,
                color: message.role === 'user' ? 'white' : 'text.primary',
                borderRadius: 2,
                position: 'relative'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography
                  variant="caption"
                  sx={{
                    color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
                {message.role === 'assistant' && (
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(message.content)}
                    sx={{ ml: 1 }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              AI is thinking...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2, backgroundColor: colors.background.paper }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask a question about clinical trial protocols..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || loading}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              color: 'white',
              '&:hover': {
                opacity: 0.9
              },
              '&:disabled': {
                background: colors.background.default,
                color: colors.text.disabled
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};
