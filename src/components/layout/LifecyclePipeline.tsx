import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { CheckCircle as CheckIcon, Lock as LockIcon } from '@mui/icons-material';
import { TRIAL_STAGES } from '../../constants/trialStages';

type PipelineVariant = 'hero' | 'dashboard' | 'workspace';

interface LifecyclePipelineProps {
  variant?: PipelineVariant;
  currentStage?: string;
  completedStages?: string[];
  onStageClick?: (stageId: string) => void;
}

export const LifecyclePipeline: React.FC<LifecyclePipelineProps> = ({
  variant = 'hero',
  currentStage,
  completedStages = [],
  onStageClick,
}) => {
  const isHero = variant === 'hero';
  const isWorkspace = variant === 'workspace';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isHero ? 'center' : 'flex-start',
        flexWrap: isWorkspace ? 'nowrap' : 'wrap',
        gap: 0,
        width: '100%',
        overflowX: isWorkspace ? 'auto' : 'visible',
        py: isWorkspace ? 0 : 0,
      }}
    >
      {TRIAL_STAGES.map((stage, index) => {
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent = currentStage === stage.id;
        const isLocked = !isHero && !isCompleted && !isCurrent && index > 0;
        const clickable = Boolean(onStageClick) && (isCompleted || isCurrent);

        return (
          <Box key={stage.id} sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Stage node */}
            <Box
              onClick={() => clickable && onStageClick?.(stage.id)}
              sx={{
                display: 'flex',
                flexDirection: isHero ? 'column' : 'row',
                alignItems: 'center',
                gap: isHero ? 1 : 1.5,
                px: isHero ? 2 : 1.5,
                py: isHero ? 1.5 : 0.75,
                borderRadius: isHero ? 3 : 2,
                cursor: clickable ? 'pointer' : isHero ? 'default' : 'not-allowed',
                border: '1px solid',
                borderColor: isCurrent
                  ? stage.color
                  : isCompleted
                  ? alpha(stage.color, 0.4)
                  : isHero
                  ? 'rgba(255,255,255,0.15)'
                  : 'transparent',
                backgroundColor: isCurrent
                  ? alpha(stage.color, 0.12)
                  : isCompleted
                  ? alpha(stage.color, 0.06)
                  : isHero
                  ? 'rgba(255,255,255,0.06)'
                  : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                minWidth: isHero ? 120 : 'auto',
                flexShrink: 0,
                '&:hover': clickable
                  ? { backgroundColor: alpha(stage.color, 0.15), borderColor: stage.color }
                  : {},
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: isHero ? 40 : 28,
                  height: isHero ? 40 : 28,
                  borderRadius: '50%',
                  backgroundColor: isHero
                    ? alpha('#fff', 0.12)
                    : isCompleted || isCurrent
                    ? alpha(stage.color, 0.12)
                    : alpha('#546E7A', 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isCompleted && !isHero ? (
                  <CheckIcon sx={{ fontSize: 16, color: stage.color }} />
                ) : isLocked ? (
                  <LockIcon sx={{ fontSize: 14, color: '#90A4AE' }} />
                ) : (
                  <stage.Icon
                    sx={{
                      fontSize: isHero ? 20 : 15,
                      color: isHero ? '#ffffff' : isCurrent ? stage.color : '#546E7A',
                    }}
                  />
                )}
              </Box>

              {/* Label + description */}
              <Box sx={{ textAlign: isHero ? 'center' : 'left' }}>
                <Typography
                  sx={{
                    fontSize: isHero ? '0.8rem' : '0.8rem',
                    fontWeight: isCurrent ? 700 : isHero ? 500 : 500,
                    color: isHero
                      ? '#ffffff'
                      : isCurrent
                      ? stage.color
                      : isCompleted
                      ? '#0A1628'
                      : '#546E7A',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stage.label}
                </Typography>

                {isHero && (
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.55)',
                      maxWidth: 110,
                      lineHeight: 1.3,
                      mt: 0.25,
                    }}
                  >
                    {stage.description.split('&')[0].trim()}
                  </Typography>
                )}

                {isCurrent && !isHero && (
                  <Typography sx={{ fontSize: '0.68rem', color: stage.color, fontWeight: 600 }}>
                    In Progress
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Connector arrow between stages */}
            {index < TRIAL_STAGES.length - 1 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: isHero ? 0.5 : 0.25,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    height: 1.5,
                    width: isHero ? 24 : 16,
                    backgroundColor: isHero
                      ? 'rgba(255,255,255,0.2)'
                      : completedStages.includes(TRIAL_STAGES[index].id)
                      ? alpha(TRIAL_STAGES[index].color, 0.4)
                      : alpha('#90A4AE', 0.3),
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: -4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 0 4px 5px',
                      borderColor: `transparent transparent transparent ${
                        isHero
                          ? 'rgba(255,255,255,0.2)'
                          : completedStages.includes(TRIAL_STAGES[index].id)
                          ? alpha(TRIAL_STAGES[index].color, 0.4)
                          : alpha('#90A4AE', 0.3)
                      }`,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
