import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
  Table, TableBody, TableCell, TableRow, Chip, IconButton,
  Divider
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Quick search protocols' },
      { keys: ['Ctrl', 'S'], description: 'Save current section' },
      { keys: ['Ctrl', 'E'], description: 'Export protocol' },
      { keys: ['Ctrl', 'N'], description: 'New protocol' },
      { keys: ['?'], description: 'Show keyboard shortcuts' }
    ]
  },
  {
    category: 'Sections',
    shortcuts: [
      { keys: ['1', '...', '9'], description: 'Jump to section 1-9' },
      { keys: ['→'], description: 'Next section' },
      { keys: ['←'], description: 'Previous section' }
    ]
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'A'], description: 'Select all' },
      { keys: ['Esc'], description: 'Close dialog' }
    ]
  }
];

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <KeyboardIcon sx={{ color: colors.primary.main, fontSize: 32 }} />
            <Typography variant="h6" fontWeight={700}>
              Keyboard Shortcuts
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {SHORTCUTS.map((category, idx) => (
          <Box key={category.category} mb={idx < SHORTCUTS.length - 1 ? 3 : 0}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {category.category}
            </Typography>
            <Table size="small">
              <TableBody>
                {category.shortcuts.map((shortcut) => (
                  <TableRow key={shortcut.description}>
                    <TableCell sx={{ border: 'none', py: 1 }}>
                      <Box display="flex" gap={1}>
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <Chip
                              label={key}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                backgroundColor: colors.background?.paper || '#fff',
                                border: '2px solid',
                                borderColor: 'divider'
                              }}
                            />
                            {keyIdx < shortcut.keys.length - 1 && (
                              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                                +
                              </Typography>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ border: 'none', py: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {shortcut.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {idx < SHORTCUTS.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage keyboard shortcuts
export const useKeyboardShortcuts = (callbacks: {
  onSave?: () => void;
  onExport?: () => void;
  onNew?: () => void;
  onHelp?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        callbacks.onSave?.();
      }

      // Ctrl+E: Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        callbacks.onExport?.();
      }

      // Ctrl+N: New
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        callbacks.onNew?.();
      }

      // ?: Help
      if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        callbacks.onHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};