import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../../styles/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider component that wraps the entire application
 * with Material-UI theme and CSS baseline
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;