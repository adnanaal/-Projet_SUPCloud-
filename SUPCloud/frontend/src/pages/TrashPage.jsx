import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import { trashService } from '../services/trashService';
import { addToast } from '../store/uiSlice';
import { refreshUser } from '../utils/refreshUser';
import { formatBytes } from '../utils/formatBytes';
import { File, Folder, Clock, Trash2 } from 'lucide-react';

const TrashPage = () => {
  const dispatch = useDispatch();
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTrashItems = async () => {
      setLoading(true);
      try {
        const data = await trashService.getTrashItems();
        setTrashItems(data.trashItems || []);
      } catch (error) {
        console.error('Erreur lors du chargement de la corbeille:', error);
        dispatch(addToast({
          message: 'Erreur lors du chargement de la corbeille',
          type: 'error'
        }));
      } finally {
        setLoading(false);
      }
    };

    loadTrashItems();
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilExpiration = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRestore = async (id) => {
    try {
      const result = await trashService.restoreTrashItem(id);
      dispatch(addToast({
        message: result.message || 'Élément restauré avec succès',
        type: 'success'
      }));
      refreshUser(dispatch);
      // Recharger la liste
      const data = await trashService.getTrashItems();
      setTrashItems(data.trashItems || []);
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      dispatch(addToast({
        message: error.response?.data?.message || 'Erreur lors de la restauration',
        type: 'error'
      }));
    }
  };

  const handleDeletePermanently = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet élément ? Cette action est irréversible.')) {
      return;
    }

    try {
      await trashService.deleteTrashItem(id);
      dispatch(addToast({
        message: 'Élément supprimé définitivement',
        type: 'success'
      }));
      // Recharger la liste
      const data = await trashService.getTrashItems();
      setTrashItems(data.trashItems || []);
    } catch (error) {
      console.error('Erreur lors de la suppression définitive:', error);
      dispatch(addToast({
        message: error.response?.data?.message || 'Erreur lors de la suppression définitive',
        type: 'error'
      }));
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Vider la corbeille ? Tous les éléments seront supprimés définitivement. Cette action est irréversible.')) {
      return;
    }

    try {
      await trashService.emptyTrash();
      dispatch(addToast({ message: 'Corbeille vidée avec succès', type: 'success' }));
      setTrashItems([]);
    } catch (error) {
      console.error('Erreur lors du vidage de la corbeille:', error);
      dispatch(addToast({
        message: error.response?.data?.message || 'Erreur lors du vidage de la corbeille',
        type: 'error'
      }));
    }
  };

  return (
    <MainLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Corbeille</h2>
          <p className="text-gray-600">Les éléments sont supprimés définitivement après 30 jours</p>
        </div>
        {trashItems.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
          >
            Vider la corbeille
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : trashItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Trash2 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">La corbeille est vide</p>
          <p className="text-sm text-gray-500">
            Les éléments supprimés apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nom</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Supprimé le</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Expiration</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trashItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {item.type === 'file' ? (
                          <File className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Folder className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="min-w-0">
                          <span className="block font-medium text-gray-900 truncate max-w-xs" title={item.name}>{item.name}</span>
                          {item.type === 'file' && item.size != null && (
                            <span className="block text-xs text-gray-500">{formatBytes(item.size)}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'file'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.type === 'file' ? 'Fichier' : 'Dossier'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(() => {
                        const daysLeft = getDaysUntilExpiration(item.expiresAt);
                        if (daysLeft === null) return 'Non disponible';
                        if (daysLeft <= 0) return 'Expiré';
                        if (daysLeft === 1) return 'Demain';
                        return `Dans ${daysLeft} jours`;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Restaurer
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(item.id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TrashPage;
