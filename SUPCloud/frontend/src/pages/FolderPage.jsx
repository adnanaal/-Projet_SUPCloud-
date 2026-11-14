import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import FileView from '../components/common/FileView';
import UploadModal from '../components/common/UploadModal';
import CreateFolderModal from '../components/common/CreateFolderModal';
import RenameModal from '../components/common/RenameModal';
import FileViewerModal from '../components/common/FileViewerModal';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { setFiles } from '../store/filesSlice';
import { setFolders } from '../store/foldersSlice';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { getMe } from '../services/userService';
import { updateUser } from '../store/authSlice';
import { closeUploadModal, closeCreateFolderModal, closeRenameModal, closeFileViewerModal, openFileViewerModal } from '../store/uiSlice';

const FolderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.files);
  const { folders } = useSelector((state) => state.folders);
  const { uploadModalOpen, createFolderModalOpen, renameModalOpen, fileViewerModalOpen, selectedItem, itemType } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(false);
  const [folder, setFolder] = useState(null);

  // Charger le dossier et ses fichiers
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Charger les informations du dossier
        const folderData = await folderService.getFolder(id);
        setFolder(folderData.folder);

        // Charger les fichiers du dossier
        const filesData = await fileService.getFiles(id);
        dispatch(setFiles(filesData.files || []));

        // Charger les sous-dossiers
        const foldersData = await folderService.getFolders(id);
        dispatch(setFolders(foldersData.folders || []));

        // Rafraîchir les informations utilisateur (stockage)
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getMe(token);
          dispatch(updateUser(userData.user));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, dispatch]);

  const breadcrumbs = [
    { label: 'Accueil', path: '/home' },
    ...(folder?.ancestors || []).map((ancestor) => ({
      label: ancestor.name,
      path: `/folders/${ancestor.id}`,
      folderId: ancestor.id,
    })),
    { label: folder?.name || 'Dossier', path: `/folders/${id}`, folderId: id },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{folder?.name || 'Dossier'}</h2>
        <p className="text-gray-600">Contenu du dossier</p>
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
          currentFolder={folder}
          breadcrumbs={breadcrumbs}
        />
      )}

      {/* Bouton flottant draggable */}
      <FloatingActionButton />

      {/* Modal d'upload */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => dispatch(closeUploadModal())}
        currentFolderId={id}
      />

      {/* Modal de création de dossier */}
      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => dispatch(closeCreateFolderModal())}
        currentFolderId={id}
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

export default FolderPage;