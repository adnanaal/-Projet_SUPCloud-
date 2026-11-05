import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { folderService } from '../../services/folderService';
import { addToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';

const RenameModal = ({ isOpen, onClose, item, itemType }) => {
  const dispatch = useDispatch();
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('Le nom est requis');
      return;
    }

    setLoading(true);

    try {
      if (itemType === 'file') {
        await fileService.renameFile(item.id, newName.trim());
        dispatch(addToast({
          message: 'Fichier renommé avec succès',
          type: 'success'
        }));
      } else if (itemType === 'folder') {
        await folderService.updateFolder(item.id, newName.trim());
        dispatch(addToast({
          message: 'Dossier renommé avec succès',
          type: 'success'
        }));
      }
      setNewName('');
      onClose();
      window.location.reload(); // Recharger pour voir le changement
    } catch (error) {
      console.error('Erreur lors du renommage:', error);
      setError(error.response?.data?.message || 'Erreur lors du renommage');
      dispatch(addToast({
        message: 'Erreur lors du renommage',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Renommer {itemType === 'file' ? 'le fichier' : 'le dossier'}
          </h2>
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
              <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau nom
              </label>
              <input
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={item.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
              <Edit className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">
                  {itemType === 'file' ? `Fichier actuel : ${item.name}` : `Dossier actuel : ${item.name}`}
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
            disabled={loading || !newName.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Renommage...' : 'Renommer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;
