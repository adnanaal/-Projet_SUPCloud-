// URL du backend (API REST et routes OAuth2). Configurable avec VITE_API_URL (voir .env.example).
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
