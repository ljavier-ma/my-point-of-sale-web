'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { getFirebaseAuth } from '../../lib/firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <Stack
        component="form"
        onSubmit={handleSubmit}
        spacing={2}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        <Typography component="h1" variant="h4" sx={{ textAlign: 'center' }}>
          Iniciar sesión
        </Typography>
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
        <Button disabled={isSubmitting} fullWidth type="submit" variant="contained" size="large">
          {isSubmitting ? <CircularProgress color="inherit" size={24} /> : 'Iniciar sesión'}
        </Button>
      </Stack>
    </Box>
  );
}
