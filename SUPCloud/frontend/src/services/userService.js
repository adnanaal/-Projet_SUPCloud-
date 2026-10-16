import axios from 'axios';

const API_URL = '/api/users';

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
 * Mettre à jour le profil utilisateur
 */
export const updateProfile = async (token, data) => {
  const response = await axios.put(`${API_URL}/me`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
