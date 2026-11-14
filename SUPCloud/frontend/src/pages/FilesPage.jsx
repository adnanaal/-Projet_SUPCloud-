import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import FileView from '../components/common/FileView';
import UploadModal from '../components/common/UploadModal';
import CreateFolderModal from '../components/common/CreateFolderModal';
import RenameModal from '../components/common/RenameModal';
import FileViewerModal from '../components/common/FileViewerModal';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { setFiles, setLoading, setError } from '../store/filesSlice';
import { setFolders } from '../store/foldersSlice';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { getMe } from '../services/userService';
import { updateUser } from '../store/authSlice';
import { closeUploadModal, closeCreateFolderModal, closeRenameModal, closeFileViewerModal, openFileViewerModal } from '../store/uiSlice';

const FilesPage = () => {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.files);
  const { folders } = useSelector((state) => state.folders);
  const { uploadModalOpen, createFolderModalOpen, renameModalOpen, fileViewerModalOpen, selectedItem, itemType } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(false);

  // Charger les fichiers et dossiers au chargement de la page
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Charger les fichiers de la racine
        const filesData = await fileService.getFiles();
        dispatch(setFiles(filesData.files || []));

        // Charger les dossiers de la racine
        const foldersData = await folderService.getFolders();
        dispatch(setFolders(foldersData.folders || []));

        // Rafraîchir les informations utilisateur (stockage)
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getMe(token);
          dispatch(updateUser(userData.user));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        dispatch(setError('Erreur lors du chargement des fichiers et dossiers'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const breadcrumbs = [
    { label: 'Mes fichiers', path: '/files' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes fichiers</h2>
        <p className="text-gray-600">Parcourez et organisez l'ensemble de vos fichiers et dossiers</p>
      </div>

      {/* FileView pour afficher les fichiers et dossiers */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : (
        <FileView
          folders={folders}
          files={files}
          currentFolder={null}
          breadcrumbs={breadcrumbs}
        />
      )}

      {/* Bouton flottant draggable */}
      <FloatingActionButton />

      {/* Modal d'upload */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => dispatch(closeUploadModal())}
        currentFolderId={null}
      />

      {/* Modal de création de dossier */}
      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => dispatch(closeCreateFolderModal())}
        currentFolderId={null}
      />

      {/* Modal de renommage */}
      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => dispatch(closeRenameModal())}
        item={selectedItem}
        itemType={itemType}
      />

      {/* Modal de visionneuse de fichiers */}
      <FileViewerModal
        isOpen={fileViewerModalOpen}
        onClose={() => dispatch(closeFileViewerModal())}
        file={selectedItem}
        files={files}
        onNavigate={(file) => dispatch(openFileViewerModal(file))}
      />
    </MainLayout>
  );
};

export default FilesPage;
