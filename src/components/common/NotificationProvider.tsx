import React from 'react';
import { SnackbarProvider } from 'notistack';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notistackRef = React.useRef<any>(null);

  const onClickDismiss = (key: string | number) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      ref={notistackRef}
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      autoHideDuration={4000}
      action={(key) => (
        <IconButton size="small" onClick={onClickDismiss(key)} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};