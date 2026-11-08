'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createAppTheme } from '../theme';

const themeStorageKey = 'my-point-of-sale-theme';

const ThemeModeContext = createContext<{
  mode: PaletteMode;
  toggleMode: () => void;
} | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within the theme mode provider.');
  }
  return context;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('light');
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    const storedMode = localStorage.getItem(themeStorageKey);
    if (storedMode === 'light' || storedMode === 'dark') {
      setMode(storedMode);
    }
    setHasLoadedTheme(true);
  }, []);

  useEffect(() => {
    if (hasLoadedTheme) {
      localStorage.setItem(themeStorageKey, mode);
    }
  }, [hasLoadedTheme, mode]);

  const toggleMode = () => {
    setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
  };
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            {children}
          </ThemeModeContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
