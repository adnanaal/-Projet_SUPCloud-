import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/search`;

export const searchService = {
  // Rechercher des fichiers et dossiers par nom
  search: async (query, { limit, signal } = {}) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, ...(limit ? { limit } : {}) },
      signal,
    });
    return response.data;
  },
};
