import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Folder, Edit, Move, Trash2, Download } from 'lucide-react';
import ActionMenu from './ActionMenu';
import { folderService } from '../../services/folderService';
import { addToast, openRenameModal, openMoveModal } from '../../store/uiSlice';
import { removeFolder } from '../../store/foldersSlice';
import { refreshUser } from '../../utils/refreshUser';
import { getDraggedItem, isSupCloudDrag, moveItemToFolder } from '../../utils/moveItem';

const FolderCard = ({ folder, onDragStart, onDragEnd, isDragging }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropTarget, setIsDropTarget] = React.useState(false);

  const handleClick = () => {
    navigate(`/folders/${folder.id}`);
  };

  const handleDownload = async () => {
    try {
      const blob = await folderService.downloadFolder(folder.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      dispatch(addToast({
        message: 'Dossier téléchargé avec succès',
        type: 'success'
      }));
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      dispatch(addToast({
        message: 'Erreur lors du téléchargement',
        type: 'error'
      }));
    }
  };

  const handleRename = () => {
    dispatch(openRenameModal({ item: folder, type: 'folder' }));
  };

  const handleMove = () => {
    dispatch(openMoveModal({ item: folder, type: 'folder' }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir mettre ce dossier à la corbeille ?')) {
      return;
    }

    try {
      await folderService.deleteFolder(folder.id);
      dispatch(removeFolder(folder.id));
      dispatch(addToast({
        message: 'Dossier mis à la corbeille',
        type: 'success'
      }));
      refreshUser(dispatch);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      dispatch(addToast({
        message: error.response?.data?.message || 'Erreur lors de la suppression',
        type: 'error'
      }));
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('type', 'folder');
    e.dataTransfer.setData('id', folder.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(folder);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  // Ce dossier est une cible de dépôt : on y déplace le fichier/dossier glissé
  const handleDragOver = (e) => {
    if (isDragging || !isSupCloudDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDropTarget(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const item = getDraggedItem(e);
    if (!item) return;

    await moveItemToFolder(dispatch, item, folder.id);
    if (onDragEnd) onDragEnd();
  };

  const menuItems = [
    { label: 'Télécharger (ZIP)', icon: Download, onClick: handleDownload },
    { label: 'Renommer', icon: Edit, onClick: handleRename },
    { label: 'Déplacer', icon: Move, onClick: handleMove },
    { label: 'Supprimer', icon: Trash2, onClick: handleDelete, danger: true },
  ];

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl shadow-sm border hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 cursor-pointer group min-w-0 ${
        isDropTarget ? 'border-brand-500 ring-2 ring-brand-300 bg-brand-50' : 'border-gray-200'
      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Folder size={32} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={folder.name}>
                  {folder.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Dossier</p>
              </div>
            </div>
          </div>
          <div className="ml-2">
            <ActionMenu items={menuItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
