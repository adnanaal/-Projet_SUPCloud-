import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { File, MoreVertical, Download, Trash2, Edit, Move, Eye } from 'lucide-react';
import FileIcon from './FileIcon';
import { formatBytes } from '../../utils/formatBytes';
import { fileService } from '../../services/fileService';
import { addToast, openRenameModal, openFileViewerModal } from '../../store/uiSlice';

const FileCard = ({ file, onDragStart, onDragEnd, isDragging }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = React.useState(false);

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
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir mettre ce fichier à la corbeille ?')) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      dispatch(addToast({
        message: 'Fichier mis à la corbeille',
        type: 'success'
      }));
      setShowMenu(false);
      window.location.reload(); // Recharger pour voir le changement
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      dispatch(addToast({
        message: 'Erreur lors de la suppression',
        type: 'error'
      }));
    }
  };

  const handleRename = () => {
    dispatch(openRenameModal({ item: file, type: 'file' }));
  };

  const handleMove = () => {
    // TODO: Implémenter le déplacement
    console.log('Move file:', file.id);
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

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/') || file.mimeType === 'application/pdf' || file.mimeType === 'text/plain' || file.mimeType === 'text/markdown' || file.mimeType === 'text/html') {
          handlePreview();
        }
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileIcon type={file.mimeType} size={32} className="text-indigo-600" />
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
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={16} className="text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                {file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/') || file.mimeType === 'application/pdf' || file.mimeType === 'text/plain' || file.mimeType === 'text/markdown' || file.mimeType === 'text/html' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye size={16} className="mr-2" />
                    Prévisualiser
                  </button>
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} className="mr-2" />
                  Renommer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Move size={16} className="mr-2" />
                  Déplacer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
