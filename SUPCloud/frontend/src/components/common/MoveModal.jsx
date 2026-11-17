import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Folder, FolderOpen, ChevronRight, Home } from 'lucide-react';
import { folderService } from '../../services/folderService';
import { closeMoveModal } from '../../store/uiSlice';
import { moveItemToFolder } from '../../utils/moveItem';

/**
 * Fenêtre « Déplacer vers… » : parcourir l'arborescence des dossiers et choisir la destination
 * d'un fichier ou d'un dossier. S'ouvre avec openMoveModal({ item, type }).
 */
const MoveModal = () => {
  const dispatch = useDispatch();
  const { moveModalOpen, selectedItem: item, itemType } = useSelector((state) => state.ui);

  // Chemin parcouru dans la fenêtre : [{ id, name }], vide = racine (« Mes fichiers »)
  const [path, setPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState('');

  const currentFolderId = path.length > 0 ? path[path.length - 1].id : null;

  useEffect(() => {
    if (moveModalOpen) {
      setPath([]);
      setError('');
    }
  }, [moveModalOpen, item?.id]);

  // Charger les sous-dossiers du dossier parcouru
  useEffect(() => {
    if (!moveModalOpen) return undefined;

    let cancelled = false;
    setLoading(true);
    setError('');

    folderService
      .getFolders(currentFolderId)
      .then((data) => {
        if (!cancelled) setFolders(data.folders || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Impossible de charger les dossiers');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [moveModalOpen, currentFolderId]);

  if (!moveModalOpen || !item) return null;

  const isFolder = itemType === 'folder';
  const itemParentId = (isFolder ? item.parentId : item.folderId) || null;

  // Un dossier ne peut pas être déplacé dans lui-même (ni donc dans ses descendants)
  const visibleFolders = folders
    .filter((folder) => !(isFolder && folder.id === item.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const alreadyHere = currentFolderId === itemParentId;
  const destinationName = path.length > 0 ? path[path.length - 1].name : 'Mes fichiers';

  const handleClose = () => {
    if (!moving) dispatch(closeMoveModal());
  };

  const handleMove = async () => {
    setMoving(true);
    const moved = await moveItemToFolder(dispatch, { type: itemType, id: item.id }, currentFolderId);
    setMoving(false);

    if (moved) {
      dispatch(closeMoveModal());
    } else {
      setError('Le déplacement a échoué. Vérifiez la destination et réessayez.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" role="dialog" aria-label="Déplacer vers">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900">Déplacer vers…</h2>
            <p className="text-sm text-gray-500 truncate" title={item.name}>
              {isFolder ? 'Dossier' : 'Fichier'} : {item.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={moving}
            aria-label="Fermer"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Chemin parcouru */}
          <nav className="flex flex-wrap items-center gap-1 text-sm mb-4" aria-label="Emplacement">
            <button
              onClick={() => setPath([])}
              className={`flex items-center px-2 py-1 rounded hover:bg-gray-100 ${
                path.length === 0 ? 'font-semibold text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Home size={14} className="mr-1" />
              Mes fichiers
            </button>
            {path.map((step, index) => (
              <React.Fragment key={step.id}>
                <ChevronRight size={14} className="text-gray-400" />
                <button
                  onClick={() => setPath(path.slice(0, index + 1))}
                  className={`px-2 py-1 rounded hover:bg-gray-100 ${
                    index === path.length - 1 ? 'font-semibold text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  {step.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* Sous-dossiers du dossier parcouru */}
          <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : visibleFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                <FolderOpen className="h-8 w-8 text-gray-300 mb-2" />
                Aucun sous-dossier ici
              </div>
            ) : (
              <ul>
                {visibleFolders.map((folder) => (
                  <li key={folder.id}>
                    <button
                      onClick={() => setPath([...path, { id: folder.id, name: folder.name }])}
                      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="flex items-center min-w-0">
                        <Folder size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
                        <span className="truncate text-sm font-medium text-gray-900" title={folder.name}>
                          {folder.name}
                        </span>
                      </span>
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0 ml-2" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {alreadyHere && !loading && (
            <p className="text-sm text-gray-500 mt-3">
              {isFolder ? 'Ce dossier' : 'Ce fichier'} se trouve déjà ici. Choisissez un autre emplacement.
            </p>
          )}
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={moving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleMove}
            disabled={moving || loading || alreadyHere}
            title={`Déplacer vers « ${destinationName} »`}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {moving ? 'Déplacement...' : 'Déplacer ici'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;
