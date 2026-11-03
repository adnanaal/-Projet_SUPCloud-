import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { folderService } from '../../services/folderService';
import { addToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';

const CreateFolderModal = ({ isOpen, onClose, currentFolderId = null }) => {
  const dispatch = useDispatch();
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!folderName.trim()) {
      setError('Le nom du dossier est requis');
      return;
    }

    setLoading(true);

    try {
      await folderService.createFolder(folderName.trim(), currentFolderId);
      dispatch(addToast({
        message: 'Dossier créé avec succès',
        type: 'success'
      }));
      setFolderName('');
      onClose();
      window.location.reload(); // Recharger pour voir le nouveau dossier
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création du dossier');
      dispatch(addToast({
        message: 'Erreur lors de la création du dossier',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Créer un dossier</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du dossier
              </label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Mon dossier"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
              <FolderPlus className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">
                  {currentFolderId
                    ? 'Le dossier sera créé dans le dossier actuel.'
                    : 'Le dossier sera créé à la racine.'}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !folderName.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
