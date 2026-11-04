import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let firebaseAuth: Auth | undefined;

function getRequiredConfigValue(name: string, value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }

  return trimmedValue;
}

export function getFirebaseAuth() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const firebaseConfig = {
    apiKey: getRequiredConfigValue(
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    ),
    authDomain: getRequiredConfigValue(
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    ),
    projectId: getRequiredConfigValue(
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ),
    appId: getRequiredConfigValue(
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    ),
  };
  const app = getApps().some(({ name }) => name === '[DEFAULT]')
    ? getApp()
    : initializeApp(firebaseConfig);

  firebaseAuth = getAuth(app);
  return firebaseAuth;
}
