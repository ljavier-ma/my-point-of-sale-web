# Personal notes

A personal project designed to provide point-of-sale (POS) functionality. The source code is publicly available so that recruiters can evaluate my programming skills; you can also see the project in action by following this [link](https://my-point-of-sale-web--my-point-of-sale-ef022.us-central1.hosted.app/login) and proceeding in test mode.

The backend repository for this project is also available for review [here](https://github.com/ljavier-ma/my-point-of-sale-backend).

The specs repository for this project is also available for review [here](https://github.com/ljavier-ma/my-point-of-sale-specs).

# Project overview

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm ci
```

Then run the project:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The development server uses the hosted backend by default. To use a backend
running locally (for example, at `http://localhost:3001`), start it with:

```bash
npm run dev -- --local-api
```

## Firebase authentication

The root route checks the Firebase authentication state and redirects signed-in users to `/dashboard` and signed-out users to `/login`.

Copy `.env.example` to `.env.local` and fill in the Firebase web app values from your Firebase project settings:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Restart the development server after changing environment variables.
