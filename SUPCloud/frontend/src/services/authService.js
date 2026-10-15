import axios from 'axios';

const API_URL = '/api/auth';

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (email, password, name) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    name,
  });
  return response.data;
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

/**
 * Déconnexion d'un utilisateur
 */
export const logout = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};

/**
 * Obtenir les informations de l'utilisateur connecté
 */
export const getMe = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Connexion avec Google OAuth2
 */
export const loginWithGoogle = () => {
  window.location.href = '/auth/google';
};

/**
 * Connexion avec GitHub OAuth2
 */
export const loginWithGitHub = () => {
  window.location.href = '/auth/github';
};
