'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '../lib/firebase';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(
      getFirebaseAuth(),
      (user) => {
        router.replace(user ? '/dashboard' : '/login');
      },
      (authError) => setError(authError.message)
    );
  }, [router]);

  return (
    <main className="flex flex-1 items-center justify-center">
      {error ? (
        <p role="alert">Unable to verify your sign-in status: {error}</p>
      ) : (
        <p aria-live="polite">Checking your sign-in status...</p>
      )}
    </main>
  );
}
