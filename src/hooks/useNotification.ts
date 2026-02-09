import { useSnackbar } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (message: string, variant: 'default' | 'error' | 'success' | 'warning' | 'info' = 'default') => {
    enqueueSnackbar(message, { variant });
  };

  return {
    success: (message: string) => showNotification(message, 'success'),
    error: (message: string) => showNotification(message, 'error'),
    warning: (message: string) => showNotification(message, 'warning'),
    info: (message: string) => showNotification(message, 'info'),
    notify: showNotification
  };
};