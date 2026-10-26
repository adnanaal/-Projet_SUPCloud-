import axios from 'axios';

const API_URL = 'http://localhost:3000/api/folders';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const folderService = {
  // Créer un dossier
  createFolder: async (name, parentId = null) => {
    const response = await axios.post(
      API_URL,
      { name, parentId },
      getAuthHeader()
    );
    return response.data;
  },

  // Récupérer tous les dossiers
  getFolders: async (parentId = null) => {
    const params = parentId ? { parentId } : {};
    const response = await axios.get(API_URL, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  // Récupérer un dossier par ID
  getFolder: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  // Mettre à jour un dossier (renommer)
  updateFolder: async (id, name) => {
    const response = await axios.put(
      `${API_URL}/${id}`,
      { name },
      getAuthHeader()
    );
    return response.data;
  },

  // Déplacer un dossier
  moveFolder: async (id, parentId = null) => {
    const response = await axios.patch(
      `${API_URL}/${id}/move`,
      { parentId },
      getAuthHeader()
    );
    return response.data;
  },

  // Supprimer un dossier (mettre à la corbeille)
  deleteFolder: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },
};
