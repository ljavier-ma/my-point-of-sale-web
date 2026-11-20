'use client';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getFirebaseAuth } from '../../lib/firebase';
import { useUserProfile } from '../../services/user/user-queries';
import { useThemeMode } from '../providers';

const drawerWidth = 264;
const DashboardUserContext = createContext<User | null>(null);

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}

function Navigation({
  onNavigate,
  onLogout,
  isLoggingOut,
  onLogoutStart,
  logoutError,
}: {
  onNavigate?: () => void;
  onLogout: () => Promise<boolean>;
  isLoggingOut: boolean;
  onLogoutStart: () => void;
  logoutError: string | null;
}) {
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          Punto de venta
        </Typography>
      </Toolbar>
      <List>
        <ListItemButton
          component={Link}
          href="/dashboard/home"
          selected={pathname === '/dashboard/home'}
          onClick={onNavigate}
        >
          <ListItemIcon>
            <DashboardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/products"
          selected={pathname === '/dashboard/products'}
          onClick={onNavigate}
        >
          <ListItemIcon>
            <Inventory2OutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Productos" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/movements"
          selected={pathname === '/dashboard/movements'}
          onClick={onNavigate}
        >
          <ListItemIcon>
            <AttachMoneyIcon />
          </ListItemIcon>
          <ListItemText primary="Movimientos" />
        </ListItemButton>
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        {logoutError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {logoutError}
          </Alert>
        )}
        <Button
          fullWidth
          color="inherit"
          type="button"
          onClick={toggleMode}
          startIcon={mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          sx={{ justifyContent: 'flex-start', py: 1.25, px: 1.5, mb: 1 }}
        >
          Cambiar tema
        </Button>
        <Button
          fullWidth
          color="inherit"
          type="button"
          disabled={isLoggingOut}
          onClick={async () => {
            onLogoutStart();
            if (await onLogout()) {
              onNavigate?.();
            }
          }}
          startIcon={
            isLoggingOut ? <CircularProgress color="inherit" size={18} /> : <LogoutOutlinedIcon />
          }
          sx={{ justifyContent: 'flex-start', py: 1.25, px: 1.5 }}
        >
          {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </Button>
      </Box>
    </Box>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: userProfile } = useUserProfile(user);

  async function handleLogout() {
    setLogoutError(null);

    try {
      await signOut(getFirebaseAuth());
      router.replace('/login');
      return true;
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Unable to log out. Please try again.'
      );
      setIsLoggingOut(false);
      return false;
    }
  }

  useEffect(() => {
    return onAuthStateChanged(
      getFirebaseAuth(),
      (currentUser) => {
        if (!currentUser) {
          router.replace('/login');
          return;
        }

        setIsLoggingOut(false);
        setUser(currentUser);
        setIsLoading(false);
      },
      (error) => {
        setAuthError(error.message);
        setIsLoading(false);
      }
    );
  }, [router]);

  if (authError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to verify your sign-in status: {authError}</Alert>
      </Box>
    );
  }

  if (isLoading || !user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress aria-label="Loading dashboard" />
      </Box>
    );
  }

  return (
    <DashboardUserContext.Provider value={user}>
      <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%',
            },
          }}
        >
          <Navigation
            onLogout={handleLogout}
            onLogoutStart={() => setIsLoggingOut(true)}
            isLoggingOut={isLoggingOut}
            logoutError={logoutError}
          />
        </Drawer>
        <Drawer
          variant="temporary"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Navigation
            onNavigate={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
            onLogoutStart={() => setIsLoggingOut(true)}
            isLoggingOut={isLoggingOut}
            logoutError={logoutError}
          />
        </Drawer>
        <Box
          component="main"
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
              display: { xs: 'block', md: 'none' },
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                aria-label="Open navigation menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div">
                Punto de venta
              </Typography>
            </Toolbar>
          </AppBar>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 3, md: 4 } }}>
            {userProfile?.isForTesting && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Esta cuenta es de solo lectura; no podrás modificar la información.
              </Alert>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    </DashboardUserContext.Provider>
  );
}
