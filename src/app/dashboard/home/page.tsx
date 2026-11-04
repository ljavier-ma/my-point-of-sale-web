'use client';

import Typography from '@mui/material/Typography';
import { useDashboardUser } from '../dashboard-shell';

export default function DashboardHomePage() {
  const user = useDashboardUser();
  const name = user?.displayName || user?.email?.split('@')[0] || 'there';

  return (
    <Typography component="h1" variant="h4">
      Hello, {name}!
    </Typography>
  );
}
