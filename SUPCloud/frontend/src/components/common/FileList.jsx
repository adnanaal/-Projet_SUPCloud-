import React from 'react';
import { useDispatch } from 'react-redux';
import { Eye, Download, Trash2, Edit, Move, MoreVertical } from 'lucide-react';
import FileIcon from './FileIcon';
import { formatBytes } from '../../utils/formatBytes';
import { fileService } from '../../services/fileService';
import { addToast, openRenameModal, openFileViewerModal } from '../../store/uiSlice';
import { removeFile } from '../../store/filesSlice';
import { refreshUser } from '../../utils/refreshUser';

const FileList = ({ files }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Taille
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modifié
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                Aucun fichier
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <FileListItem key={file.id} file={file} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const FileListItem = ({ file }) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = React.useState(false);

  const handlePreview = () => {
    dispatch(openFileViewerModal(file));
  };

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
      dispatch(removeFile(file.id));
      dispatch(addToast({
        message: 'Fichier mis à la corbeille',
        type: 'success'
      }));
      setShowMenu(false);
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
    setShowMenu(false);
  };

  const handleMove = () => {
    // TODO: Implémenter le déplacement
    console.log('Move file:', file.id);
    setShowMenu(false);
  };

  return (
    <tr
      className="hover:bg-gray-50 group cursor-pointer"
      onClick={handlePreview}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('type', 'file');
        e.dataTransfer.setData('id', file.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileIcon type={file.mimeType} size={20} className="text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.name}>
              {file.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formatBytes(Number(file.size))}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{file.mimeType}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {new Date(file.updatedAt).toLocaleDateString('fr-FR')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative inline-block">
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview();
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye size={16} className="mr-2" />
                Prévisualiser
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
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
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default FileList;
