import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Application Error</AlertTitle>
            Something went wrong while loading the Clinical Trials Platform.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Error Details:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1, 
            mb: 2,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto'
          }}>
            <Typography variant="body2" component="pre">
              {this.state.error?.message}
            </Typography>
            {this.state.error?.stack && (
              <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                {this.state.error.stack}
              </Typography>
            )}
          </Box>
          
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Reload Page
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => this.setState({ hasError: false } as State)}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;