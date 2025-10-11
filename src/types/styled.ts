// TypeScript interfaces for styled components and design system

import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

// Base component props
export interface BaseStyledProps {
  className?: string;
  sx?: SxProps<Theme>;
  children?: ReactNode;
}

// Layout component props
export interface LayoutProps extends BaseStyledProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

export interface ContentAreaProps extends BaseStyledProps {
  direction?: 'row' | 'column';
  spacing?: number;
}

export interface DocumentPanelProps extends BaseStyledProps {
  isOpen?: boolean;
  width?: number | string;
  position?: 'left' | 'right';
}

// Card component props
export interface TrialCardProps extends BaseStyledProps {
  selected?: boolean;
  bookmarked?: boolean;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
  onBookmark?: () => void;
}

export interface FeatureCardProps extends BaseStyledProps {
  icon?: ReactNode;
  title: string;
  description: string;
  demo?: ReactNode;
}

export interface DocumentCardProps extends BaseStyledProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (content: string) => void;
}

// Button component props
export interface ButtonProps extends BaseStyledProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface VoiceButtonProps extends BaseStyledProps {
  recording?: boolean;
  onToggleRecording?: () => void;
}

export interface GenerateButtonProps extends ButtonProps {
  progress?: number;
}

// Typography component props
export interface TypographyProps extends BaseStyledProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error';
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface CTRINumberProps extends BaseStyledProps {
  number: string;
  clickable?: boolean;
  onCopy?: () => void;
}

export interface PhaseTextProps extends BaseStyledProps {
  phase: 'I' | 'II' | 'III' | 'IV';
}

export interface StatusTextProps extends BaseStyledProps {
  status: 'recruiting' | 'not_yet_recruiting' | 'completed' | 'suspended';
}

export interface TruncatedTextProps extends BaseStyledProps {
  lines?: number;
  text: string;
}

// Input component props
export interface SearchInputProps extends BaseStyledProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  loading?: boolean;
}

export interface FormInputProps extends BaseStyledProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

export interface AutocompleteProps extends BaseStyledProps {
  options: Array<{ label: string; value: string; category?: string }>;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  loading?: boolean;
}

export interface SliderProps extends BaseStyledProps {
  min: number;
  max: number;
  value: number | number[];
  onChange: (value: number | number[]) => void;
  step?: number;
  marks?: Array<{ value: number; label: string }>;
  valueLabelDisplay?: 'auto' | 'on' | 'off';
}

// Status component props
export interface StatusChipProps extends BaseStyledProps {
  status: 'recruiting' | 'not_yet_recruiting' | 'completed' | 'suspended';
  size?: 'small' | 'medium';
}

export interface PhaseChipProps extends BaseStyledProps {
  phase: 'I' | 'II' | 'III' | 'IV';
  size?: 'small' | 'medium';
}

export interface PriorityBadgeProps extends BaseStyledProps {
  priority: 'high' | 'medium' | 'low';
  count?: number;
}

export interface ProgressIndicatorProps extends BaseStyledProps {
  progress: number;
  showLabel?: boolean;
  color?: 'primary' | 'secondary';
}

export interface ConnectionStatusProps extends BaseStyledProps {
  online: boolean;
  showLabel?: boolean;
}

export interface ConfidenceScoreProps extends BaseStyledProps {
  score: number;
  showBar?: boolean;
  showLabel?: boolean;
}

// Navigation component props
export interface NavMenuItemProps extends BaseStyledProps {
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarNavButtonProps extends BaseStyledProps {
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export interface TabButtonProps extends BaseStyledProps {
  active?: boolean;
  onClick?: () => void;
}

export interface PaginationButtonProps extends BaseStyledProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface FilterTagProps extends BaseStyledProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}

// Theme-related types
export interface SpacingValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ColorPalette {
  primary: {
    main: string;
    dark: string;
    light: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    dark: string;
    light: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
  status: {
    recruiting: string;
    notYetRecruiting: string;
    completed: string;
    suspended: string;
    active: string;
  };
  medical: {
    phase1: string;
    phase2: string;
    phase3: string;
    phase4: string;
    observational: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// Responsive breakpoint types
export interface BreakpointValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

// Component size variants
export type ComponentSize = 'small' | 'medium' | 'large';
export type ComponentVariant = 'contained' | 'outlined' | 'text';
export type ComponentColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Animation and transition types
export interface AnimationProps {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface TransitionProps extends AnimationProps {
  enter?: boolean;
  exit?: boolean;
}

// Grid and layout types
export interface GridProps extends BaseStyledProps {
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  spacing?: number;
}

export interface FlexProps extends BaseStyledProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number;
}

// Form and validation types
export interface FormFieldProps extends BaseStyledProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormValidation {
  [fieldName: string]: ValidationRule;
}

// Loading and error state types
export interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  retry?: () => void;
}

export interface SkeletonProps extends BaseStyledProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

// Accessibility types
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Event handler types
export interface EventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onChange?: (event: React.ChangeEvent) => void;
}

// Combined props for complex components
export interface ComplexComponentProps extends BaseStyledProps, AccessibilityProps, EventHandlers, LoadingStateProps {
  id?: string;
  testId?: string;
}