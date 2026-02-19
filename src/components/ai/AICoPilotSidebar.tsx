import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Psychology as AIIcon,
  Lightbulb as TipIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Info as InfoIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useAICoPilot } from '../../contexts/AICoPilotContext';
import { colors } from '../../styles/theme';

export const AICoPilotSidebar: React.FC = () => {
  const { currentField, guidance, isAnalyzing, validation } = useAICoPilot();

  if (!currentField) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={6}>
            <AIIcon sx={{ fontSize: 72, color: colors.text.disabled, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom color="text.secondary">
              AI Co-Pilot Ready
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click on any field to get intelligent assistance
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ position: 'sticky', top: 100 }}>
      {/* AI Co-Pilot Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AIIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                AI Co-Pilot
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Watching your input in real-time
              </Typography>
            </Box>
            {isAnalyzing && (
              <SpeedIcon
                sx={{
                  color: colors.primary.main,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }}
              />
            )}
          </Box>

          {isAnalyzing && <LinearProgress sx={{ mb: 1 }} />}

          <Chip
            label={currentField.fieldName}
            size="small"
            icon={<InfoIcon />}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              color: 'white',
              fontWeight: 600,
              maxWidth: '100%'
            }}
          />
        </CardContent>
      </Card>

      {/* Real-Time Validation Status */}
      {validation && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Alert
              severity={
                validation.status === 'valid' ? 'success' :
                validation.status === 'warning' ? 'warning' :
                validation.status === 'error' ? 'error' : 'info'
              }
              icon={
                validation.status === 'valid' ? <CheckIcon /> : <InfoIcon />
              }
              sx={{
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                {validation.status === 'valid' ? '✓ Looking Good!' :
                 validation.status === 'warning' ? '⚡ Suggestion' :
                 validation.status === 'error' ? '⚠️ Needs Attention' : '💡 Tip'}
              </Typography>
              <Typography variant="body2">
                {validation.message}
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* AI Guidance & Tips */}
      {guidance && guidance.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TipIcon sx={{ color: colors.semantic.warning }} />
              <Typography variant="subtitle1" fontWeight={700}>
                AI Guidance
              </Typography>
            </Box>
            <List dense disablePadding>
              {guidance.map((tip, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                      <UncheckedIcon sx={{ fontSize: 16, color: colors.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { lineHeight: 1.6 }
                      }}
                    />
                  </ListItem>
                  {index < guidance.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* ICH M11 Requirements */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            📋 Field Requirements
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon sx={{ color: colors.semantic.success, fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="ICH M11 Compliant"
                secondary="Follow regulatory structure"
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon sx={{ color: colors.semantic.success, fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Formal Language"
                secondary="Professional, regulatory tone"
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon sx={{ color: colors.semantic.info, fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Be Specific"
                secondary="Include all required details"
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
