import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Divider,
  Alert,
  Paper,
  Fade,
  Collapse
} from '@mui/material';
import {
  Psychology as AIIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Calculate as CalculateIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface SampleSizeCalculation {
  totalSampleSize: number;
  sampleSizePerArm: number;
  expectedDropoutRate: number;
  justification: string;
  powerAnalysis: string;
  assumptions: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface AISampleSizeAgentProps {
  protocolContext: any;
  onApplyCalculation: (calculation: SampleSizeCalculation) => void;
  initialData?: any;
}

export const AISampleSizeAgent: React.FC<AISampleSizeAgentProps> = ({
  protocolContext,
  onApplyCalculation,
  initialData
}) => {
  console.log('AISampleSizeAgent rendering with context:', protocolContext);
  
  const [expanded, setExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState<SampleSizeCalculation | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'intro' | 'gathering' | 'calculating' | 'complete'>('intro');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start conversation
    initiateConversation();
  }, []);

  const initiateConversation = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hi! I'm your AI Sample Size Calculator. I'll help you determine the optimal sample size for your clinical trial through a quick conversation.

Let me gather some key information:

**Study Details I Have:**
${protocolContext?.indication ? `• Indication: ${protocolContext.indication}` : ''}
${protocolContext?.trialPhase ? `• Phase: ${protocolContext.trialPhase}` : ''}
${protocolContext?.studyDesignType ? `• Design: ${protocolContext.studyDesignType}` : ''}

**What I need to know:**

1. **Primary endpoint type**: Is it continuous (e.g., change in blood pressure) or binary (e.g., response rate, mortality)?

2. **Effect size**: What difference do you expect to see? For example:
   - Continuous: "10-point reduction in systolic BP"
   - Binary: "20% response rate vs 40% response rate"

3. **Statistical parameters**: 
   - Desired power (typically 80% or 90%)
   - Significance level (typically 0.05)

4. **Expected dropout rate**: What percentage of patients might drop out?

Let's start with question 1: **Is your primary endpoint continuous or binary?**`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    setConversationPhase('gathering');
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      // Build conversation context
      const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      
      const prompt = `You are an expert biostatistician with deep knowledge of clinical trial design and sample size calculations. You help researchers determine optimal sample sizes through conversational guidance.

PROTOCOL CONTEXT:
- Indication: ${protocolContext?.indication || 'Not specified'}
- Phase: ${protocolContext?.trialPhase || 'Not specified'}
- Design: ${protocolContext?.studyDesignType || 'Not specified'}
- Number of Arms: ${protocolContext?.numberOfArms || 2}
- Control Type: ${protocolContext?.controlType || 'Not specified'}

CONVERSATION SO FAR:
${conversationHistory}

USER'S LATEST RESPONSE:
${userInput}

YOUR TASK:
1. Analyze the user's response carefully
2. Extract statistical parameters: endpoint type, effect size, power, alpha, dropout rate, standard deviation (for continuous)
3. If you have ALL required information, perform the calculation
4. If missing information, ask ONE specific follow-up question

REQUIRED INFORMATION CHECKLIST:
For Binary Endpoints:
- Control group proportion (p1)
- Treatment group proportion (p2)
- Power (default 80% if not specified)
- Alpha (default 0.05 if not specified)
- Dropout rate (default 15% if not specified)

For Continuous Endpoints:
- Expected mean difference (δ)
- Standard deviation (σ)
- Power (default 80% if not specified)
- Alpha (default 0.05 if not specified)
- Dropout rate (default 15% if not specified)

SAMPLE SIZE CALCULATION FORMULAS:

For Binary Endpoints (Two Proportions):
n_per_arm = [(Zα/2 + Zβ)² × (p1(1-p1) + p2(1-p2))] / (p1 - p2)²

For Continuous Endpoints (Two Means):
n_per_arm = 2 × [(Zα/2 + Zβ)² × σ²] / δ²

Where:
- Zα/2 = 1.96 for α=0.05 (two-sided), 2.576 for α=0.01
- Zβ = 0.84 for 80% power, 1.28 for 90% power, 1.645 for 95% power
- Round UP to nearest integer

Adjust for dropout: n_adjusted = n / (1 - dropout_rate)
Total sample size = n_adjusted × number_of_arms

CALCULATION STEPS:
1. Calculate n_per_arm using appropriate formula
2. Round UP to nearest integer
3. Adjust for dropout
4. Multiply by number of arms for total

RESPONSE FORMAT:
If you have ALL required info, respond with:
CALCULATION_READY
Total Sample Size: [number]
Per Arm: [number]
Justification: Sample size calculated using [formula type] for [endpoint description]. With [power]% power to detect a difference of [effect size] at α=[alpha] (two-sided), we need [n_per_arm] participants per arm. Accounting for [dropout]% dropout rate, total sample size is [total].
Power Analysis: This study is powered at [power]% to detect [effect size] with [alpha] significance level. The calculation assumes [key assumptions].
Assumptions: [list 3-5 key assumptions]
Confidence: [high/medium/low based on quality of inputs]

If you need more info, respond with:
NEED_MORE_INFO
[Ask ONE specific follow-up question with examples]

IMPORTANT:
- Be conversational and friendly
- Explain statistical concepts simply
- Provide context for why you're asking each question
- Give examples to help users understand what you need
- If user provides vague info, ask for clarification with specific examples
- Always show your calculation logic in the justification
`;

      const response = await aiService.getSectionAssistance(
        '10', // Statistical Considerations section
        { conversation: conversationHistory },
        prompt,
        protocolContext
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if calculation is ready
      if (response.content.includes('CALCULATION_READY')) {
        parseCalculation(response.content);
        setConversationPhase('complete');
      }

    } catch (error) {
      console.error('AI conversation error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Let me try to help you with a standard calculation. Could you provide: endpoint type (continuous/binary), expected effect size, desired power (80% or 90%), and expected dropout rate?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const parseCalculation = (content: string) => {
    try {
      const lines = content.split('\n');
      let totalSize = 0;
      let perArm = 0;
      let justification = '';
      let powerAnalysis = '';
      let assumptions: string[] = [];
      let confidence: 'high' | 'medium' | 'low' = 'medium';

      lines.forEach(line => {
        if (line.includes('Total Sample Size:')) {
          totalSize = parseInt(line.match(/\d+/)?.[0] || '0');
        } else if (line.includes('Per Arm:')) {
          perArm = parseInt(line.match(/\d+/)?.[0] || '0');
        } else if (line.includes('Justification:')) {
          justification = line.split('Justification:')[1]?.trim() || '';
        } else if (line.includes('Power Analysis:')) {
          powerAnalysis = line.split('Power Analysis:')[1]?.trim() || '';
        } else if (line.includes('Assumptions:')) {
          const assumptionText = line.split('Assumptions:')[1]?.trim() || '';
          assumptions = assumptionText.split(',').map(a => a.trim());
        } else if (line.includes('Confidence:')) {
          const conf = line.split('Confidence:')[1]?.trim().toLowerCase();
          if (conf === 'high' || conf === 'medium' || conf === 'low') {
            confidence = conf;
          }
        }
      });

      const calc: SampleSizeCalculation = {
        totalSampleSize: totalSize,
        sampleSizePerArm: perArm,
        expectedDropoutRate: 0.15, // Default, can be extracted from conversation
        justification,
        powerAnalysis,
        assumptions,
        confidence
      };

      setCalculation(calc);
    } catch (error) {
      console.error('Error parsing calculation:', error);
    }
  };

  const handleApply = () => {
    if (calculation) {
      onApplyCalculation(calculation);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCalculation(null);
    setConversationPhase('intro');
    initiateConversation();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card
      sx={{
        mb: 3,
        border: 2,
        borderColor: 'primary.main',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #1A73E8, #4CAF50)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <AIIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              AI Sample Size Calculator
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Conversational agent powered by statistical formulas
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          {calculation && (
            <Chip
              label="Calculation Ready"
              icon={<CheckIcon />}
              sx={{
                background: '#4CAF50',
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white' }}
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 0 }}>
          {/* Conversation Area */}
          <Box
            sx={{
              height: 400,
              overflowY: 'auto',
              p: 2,
              background: '#f8f9fa'
            }}
          >
            {messages.map((message, index) => (
              <Fade in key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '75%',
                      background: message.role === 'user'
                        ? 'linear-gradient(135deg, #1A73E8, #1557B0)'
                        : 'white',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      boxShadow: message.role === 'user' ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    {message.role === 'assistant' && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <SparkleIcon sx={{ fontSize: 16, color: '#1A73E8' }} />
                        <Typography variant="caption" fontWeight={600} color="primary">
                          AI Assistant
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                        '& strong': { fontWeight: 700 }
                      }}
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                  </Paper>
                </Box>
              </Fade>
            ))}
            {loading && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, background: 'white', borderTop: '1px solid #e0e0e0' }}>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Type your response..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || conversationPhase === 'complete'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!userInput.trim() || loading || conversationPhase === 'complete'}
                sx={{
                  minWidth: 100,
                  background: 'linear-gradient(135deg, #1A73E8, #4CAF50)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1557B0, #388E3C)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </Button>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="caption" color="text.secondary">
                Press Enter to send, Shift+Enter for new line
              </Typography>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{ textTransform: 'none' }}
              >
                Start Over
              </Button>
            </Box>
          </Box>

          {/* Calculation Result */}
          {calculation && (
            <Box sx={{ p: 2, background: 'rgba(76, 175, 80, 0.1)', borderTop: '2px solid #4CAF50' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalculateIcon sx={{ color: '#4CAF50' }} />
                <Typography variant="h6" fontWeight={700} sx={{ color: '#4CAF50' }}>
                  Sample Size Calculation Complete
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box display="flex" gap={2} mb={2}>
                  <Card sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Sample Size
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {calculation.totalSampleSize}
                    </Typography>
                  </Card>
                  <Card sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Per Arm
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {calculation.sampleSizePerArm}
                    </Typography>
                  </Card>
                  <Card sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Dropout Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {(calculation.expectedDropoutRate * 100).toFixed(0)}%
                    </Typography>
                  </Card>
                </Box>

                {calculation.justification && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Justification:
                    </Typography>
                    <Typography variant="body2">
                      {calculation.justification}
                    </Typography>
                  </Alert>
                )}

                {calculation.powerAnalysis && (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Power Analysis:
                    </Typography>
                    <Typography variant="body2">
                      {calculation.powerAnalysis}
                    </Typography>
                  </Alert>
                )}
              </Box>

              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckIcon />}
                  onClick={handleApply}
                  sx={{
                    background: '#4CAF50',
                    '&:hover': { background: '#4CAF50', filter: 'brightness(0.9)' }
                  }}
                >
                  Apply to Protocol
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleReset}
                  sx={{ minWidth: 150 }}
                >
                  Recalculate
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};
