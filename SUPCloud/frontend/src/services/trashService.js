import axios from 'axios';

const API_URL = 'http://localhost:3000/api/trash';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const trashService = {
  // Récupérer tous les éléments de la corbeille
  getTrashItems: async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  },

  // Restaurer un élément
  restoreTrashItem: async (id) => {
    const response = await axios.post(
      `${API_URL}/${id}/restore`,
      {},
      getAuthHeader()
    );
    return response.data;
  },

  // Supprimer définitivement un élément
  deleteTrashItem: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  // Vider la corbeille
  emptyTrash: async () => {
    const response = await axios.delete(API_URL, getAuthHeader());
    return response.data;
  },
};
