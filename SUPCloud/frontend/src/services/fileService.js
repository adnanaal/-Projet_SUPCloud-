import axios from 'axios';

const API_URL = 'http://localhost:3000/api/files';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fileService = {
  // Uploader un fichier
  uploadFile: async (file, folderId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const response = await axios.post(`${API_URL}/upload`, formData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Récupérer tous les fichiers
  getFiles: async (folderId = null) => {
    const params = folderId ? { folderId } : {};
    const response = await axios.get(API_URL, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  // Récupérer un fichier par ID
  getFile: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  // Renommer un fichier
  renameFile: async (id, name) => {
    const response = await axios.put(
      `${API_URL}/${id}`,
      { name },
      getAuthHeader()
    );
    return response.data;
  },

  // Déplacer un fichier
  moveFile: async (id, folderId = null) => {
    const response = await axios.patch(
      `${API_URL}/${id}/move`,
      { folderId },
      getAuthHeader()
    );
    return response.data;
  },

  // Supprimer un fichier (mettre à la corbeille)
  deleteFile: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  // Télécharger un fichier
  downloadFile: async (id) => {
    const response = await axios.get(
      `${API_URL}/${id}/download`,
      {
        ...getAuthHeader(),
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
