import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Edit, Move, Eye } from 'lucide-react';
import ActionMenu from './ActionMenu';
import FileIcon from './FileIcon';
import { formatBytes } from '../../utils/formatBytes';
import { fileService } from '../../services/fileService';
import { addToast, openRenameModal, openMoveModal, openFileViewerModal } from '../../store/uiSlice';
import { removeFile } from '../../store/filesSlice';
import { refreshUser } from '../../utils/refreshUser';

const FileCard = ({ file, onDragStart, onDragEnd, isDragging }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDownload = async () => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      dispatch(addToast({
        message: 'Fichier téléchargé avec succès',
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

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir mettre ce fichier à la corbeille ?')) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      dispatch(removeFile(file.id));
      dispatch(addToast({
        message: 'Fichier mis à la corbeille',
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

  const handleRename = () => {
    dispatch(openRenameModal({ item: file, type: 'file' }));
  };

  const handleMove = () => {
    dispatch(openMoveModal({ item: file, type: 'file' }));
  };

  const handlePreview = () => {
    dispatch(openFileViewerModal(file));
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('type', 'file');
    e.dataTransfer.setData('id', file.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(file);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  const menuItems = [
    { label: 'Prévisualiser', icon: Eye, onClick: handlePreview },
    { label: 'Télécharger', icon: Download, onClick: handleDownload },
    { label: 'Renommer', icon: Edit, onClick: handleRename },
    { label: 'Déplacer', icon: Move, onClick: handleMove },
    { label: 'Supprimer', icon: Trash2, onClick: handleDelete, danger: true },
  ];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200/80 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 cursor-pointer group min-w-0 ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handlePreview}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <FileIcon type={file.mimeType} size={32} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBytes(Number(file.size))}
                </p>
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

export default FileCard;
