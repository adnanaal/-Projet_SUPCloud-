import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

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
 * Connexion avec Google OAuth2
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

/**
 * Connexion avec GitHub OAuth2
 */
export const loginWithGitHub = () => {
  window.location.href = `${API_BASE_URL}/auth/github`;
};

/**
 * Connexion avec Microsoft OAuth2
 */
export const loginWithMicrosoft = () => {
  window.location.href = `${API_BASE_URL}/auth/microsoft`;
};
