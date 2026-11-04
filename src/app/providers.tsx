'use client';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { createAppTheme } from '../theme';

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('light');
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IconButton
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          color="inherit"
          onClick={() => setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'))}
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: (currentTheme) => currentTheme.zIndex.tooltip }}
        >
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
