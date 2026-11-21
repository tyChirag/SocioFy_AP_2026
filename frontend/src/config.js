const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();
export const BaseUrl = rawUrl.replace(/\/+$/, '');
