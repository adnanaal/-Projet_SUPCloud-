import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, List, SortAsc } from 'lucide-react';
import FileCard from './FileCard';
import FolderCard from './FolderCard';
import FileList from './FileList';
import Breadcrumbs from './Breadcrumbs';
import { fileService } from '../../services/fileService';
import { folderService } from '../../services/folderService';
import { addToast } from '../../store/uiSlice';

const FileView = ({ folders = [], files = [], currentFolder = null, breadcrumbs = [] }) => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'list'
  const [draggedItem, setDraggedItem] = React.useState(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDraggingOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (!draggedItem) return;

    const type = e.dataTransfer.getData('type');
    const id = e.dataTransfer.getData('id');

    try {
      if (type === 'file') {
        await fileService.moveFile(id, currentFolder?.id || null);
        dispatch(addToast({ message: 'Fichier déplacé avec succès', type: 'success' }));
      } else if (type === 'folder') {
        await folderService.moveFolder(id, currentFolder?.id || null);
        dispatch(addToast({ message: 'Dossier déplacé avec succès', type: 'success' }));
      }
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      dispatch(addToast({ message: 'Erreur lors du déplacement', type: 'error' }));
    }

    setDraggedItem(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-colors ${isDraggingOver ? 'bg-indigo-50' : ''}`}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Barre d'outils */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Vue grille"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Vue liste"
          >
            <List size={20} />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <SortAsc size={16} />
            <span className="text-sm">Trier</span>
          </button>
        </div>
      </div>

      {/* Affichage des dossiers */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Dossiers
          </h3>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === folder.id}
                />
              ))}
            </div>
          ) : (
            <FileList files={[]} />
          )}
        </div>
      )}

      {/* Affichage des fichiers */}
      {files.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Fichiers
          </h3>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === file.id}
                />
              ))}
            </div>
          ) : (
            <FileList files={files} />
          )}
        </div>
      )}

      {/* État vide */}
      {folders.length === 0 && files.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Ce dossier est vide</p>
          <p className="text-sm text-gray-500">
            Uploadez des fichiers ou créez des dossiers pour commencer
          </p>
        </div>
      )}
    </div>
  );
};

export default FileView;
