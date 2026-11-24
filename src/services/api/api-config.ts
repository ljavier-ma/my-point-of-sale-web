export const API_BASE_URL =
  process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true'
    ? 'http://localhost:3000'
    : 'https://my-point-of-sale-backend--my-point-of-sale-ef022.us-central1.hosted.app';
