'use client';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useDashboardUser } from '../dashboard-shell';
import { useUserProfile } from '../../../services/user/user-queries';

export default function DashboardHomePage() {
  const user = useDashboardUser();
  const { data: profile, error, isPending } = useUserProfile(user);

  if (isPending) {
    return <CircularProgress aria-label="Loading user name" />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Typography component="h1" variant="h4">
      ¡Hola, {profile.name}!
    </Typography>
  );
}
