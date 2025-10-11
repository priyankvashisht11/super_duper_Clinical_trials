import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { documentService } from '../../services/documentService';
import { DocumentGenerationRequest, DocumentGenerationResponse, Citation } from '../../types';

interface StreamingDocumentGeneratorProps {
  request: DocumentGenerationRequest;
  onComplete?: (response: DocumentGenerationResponse) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
}

export const StreamingDocumentGenerator: React.FC<StreamingDocumentGeneratorProps> = ({
  request,
  onComplete,
  onError,
  autoStart = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready to generate');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);

  const generatorRef = useRef<AsyncGenerator<any, DocumentGenerationResponse, unknown> | null>(null);
  const startTimeRef = useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoStart) {
      handleStartGeneration();
    }
  }, [autoStart]);

  useEffect(() => {
    // Auto-scroll to bottom as content is generated
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isGenerating]);

  const handleStartGeneration = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setContent('');
    setProgress(0);
    setStatus('Initializing...');
    setError(null);
    setIsComplete(false);
    startTimeRef.current = Date.now();

    try {
      generatorRef.current = documentService.generateStreamingDocument(
        request,
        (progress, status) => {
          setProgress(progress);
          setStatus(status);
        }
      );

      let accumulatedContent = '';

      for await (const result of generatorRef.current) {
        if ('chunk' in result) {
          // Streaming chunk
          accumulatedContent += result.chunk;
          setContent(accumulatedContent);
          setProgress(result.progress);
          setStatus(result.status);
        } else {
          // Final result
          setCitations(result.citations);
          setIsComplete(true);
          setGenerationTime(Date.now() - startTimeRef.current);
          onComplete?.(result);
        }
      }

      setStatus('Generation complete');
      setProgress(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
      generatorRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (generatorRef.current) {
      generatorRef.current.return?.(undefined);
      generatorRef.current = null;
    }
    setIsGenerating(false);
    setStatus('Generation stopped');
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setStatus('Content copied to clipboard');
      setTimeout(() => setStatus('Generation complete'), 2000);
    } catch (err) {
      setError('Failed to copy content');
    }
  };

  const handleExport = async (format: 'docx' | 'pdf' | 'txt') => {
    if (!content || !isComplete) return;

    try {
      setStatus(`Exporting as ${format.toUpperCase()}...`);
      const { blob, filename } = await documentService.exportDocument(
        content,
        citations,
        format,
        `clinical-trials-${request.templateType}`
      );
      
      documentService.downloadDocument(blob, filename);
      setStatus('Export complete');
      setTimeout(() => setStatus('Generation complete'), 2000);
    } catch (err) {
      setError(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = () => {
    if (error) return 'error';
    if (isComplete) return 'success';
    if (isGenerating) return 'primary';
    return 'default';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with controls */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            AI Document Generator
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isGenerating && !isComplete && (
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleStartGeneration}
                disabled={request.trialIds.length === 0}
              >
                Generate
              </Button>
            )}
            {isGenerating && (
              <Button
                variant="outlined"
                startIcon={<StopIcon />}
                onClick={handleStopGeneration}
                color="error"
              >
                Stop
              </Button>
            )}
            {isComplete && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleStartGeneration}
              >
                Regenerate
              </Button>
            )}
          </Box>
        </Box>

        {/* Progress and status */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              label={status}
              color={getStatusColor()}
              size="small"
              icon={isGenerating ? <CircularProgress size={16} /> : undefined}
            />
            {isComplete && (
              <Typography variant="caption" color="text.secondary">
                Generated in {(generationTime / 1000).toFixed(1)}s
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Export controls */}
        {isComplete && (
          <Fade in={isComplete}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Export:
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleExport('txt')}
              >
                TXT
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleExport('docx')}
              >
                DOCX
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleExport('pdf')}
              >
                PDF
              </Button>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <IconButton
                size="small"
                onClick={handleCopyContent}
                title="Copy to clipboard"
              >
                <CopyIcon />
              </IconButton>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content display */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Paper
          ref={contentRef}
          sx={{
            flex: 1,
            m: 2,
            p: 3,
            overflow: 'auto',
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            position: 'relative'
          }}
        >
          {content ? (
            <Box>
              <Typography
                component="div"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  '& h1, & h2, & h3': {
                    mt: 3,
                    mb: 2,
                    fontWeight: 'bold'
                  },
                  '& h1': { fontSize: '1.5rem' },
                  '& h2': { fontSize: '1.25rem' },
                  '& h3': { fontSize: '1.1rem' },
                  '& p': { mb: 2 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& li': { mb: 0.5 }
                }}
              >
                {content}
              </Typography>
              
              {/* Typing cursor effect */}
              {isGenerating && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.2em',
                    backgroundColor: 'primary.main',
                    animation: 'blink 1s infinite',
                    '@keyframes blink': {
                      '0%, 50%': { opacity: 1 },
                      '51%, 100%': { opacity: 0 }
                    }
                  }}
                />
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <Typography variant="body1">
                {isGenerating ? 'Generating content...' : 'Click "Generate" to start creating your document'}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Citations */}
        {citations.length > 0 && (
          <Paper sx={{ m: 2, mt: 0, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              References ({citations.length})
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {citations.map((citation, index) => (
                <Typography
                  key={citation.id}
                  variant="body2"
                  sx={{ mb: 1, fontSize: '0.875rem' }}
                >
                  <strong>{index + 1}.</strong> {citation.text}
                </Typography>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default StreamingDocumentGenerator;