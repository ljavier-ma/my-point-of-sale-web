'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { getFirebaseAuth } from '../../lib/firebase';
import { API_BASE_URL } from '../../services/api/api-config';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestLogin, setIsTestLogin] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace('/dashboard/home');
    } catch (signInError) {
      setError(
        signInError instanceof Error ? signInError.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTestLogin() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setIsTestLogin(true);

    try {
      const response = await fetch(`${API_BASE_URL}/test-login`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === 'object' && result !== null ? Reflect.get(result, 'error') : undefined;
        throw new Error(
          typeof message === 'string'
            ? message
            : `Test login failed with status ${response.status}.`
        );
      }

      const token =
        typeof result === 'object' && result !== null ? Reflect.get(result, 'token') : undefined;
      if (typeof token !== 'string' || !token.trim()) {
        throw new Error('The test login response did not contain a valid token.');
      }

      await signInWithCustomToken(getFirebaseAuth(), token);
      router.replace('/dashboard/home');
    } catch (signInError) {
      setError(
        signInError instanceof Error ? signInError.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setIsTestLogin(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
        <Typography component="h1" variant="h4" sx={{ textAlign: 'center' }}>
          Iniciar sesión
        </Typography>
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            autoComplete="email"
            autoFocus
            fullWidth
            label="Correo electrónico"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            fullWidth
            label="Contraseña"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            disabled={isSubmitting}
            fullWidth
            type="submit"
            variant="contained"
            size="large"
          >
            {isSubmitting && !isTestLogin ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </Stack>
        <Divider>o</Divider>
        <Button
          disabled={isSubmitting}
          fullWidth
          type="button"
          variant="contained"
          size="large"
          onClick={handleTestLogin}
        >
          {isSubmitting && isTestLogin ? (
            <CircularProgress color="inherit" size={24} />
          ) : (
            'Modo prueba'
          )}
        </Button>
      </Stack>
    </Box>
  );
}
