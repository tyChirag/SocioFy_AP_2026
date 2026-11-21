const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://sociofy-ap-2026.onrender.com';
const rawUrl = (import.meta.env.VITE_API_URL || defaultApiUrl).trim();

export const BaseUrl = rawUrl.replace(/\/+$/, '');
