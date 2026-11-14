import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import FileView from '../components/common/FileView';
import RenameModal from '../components/common/RenameModal';
import FileViewerModal from '../components/common/FileViewerModal';
import { setFiles, setError } from '../store/filesSlice';
import { fileService } from '../services/fileService';
import { refreshUser } from '../utils/refreshUser';
import { closeRenameModal, closeFileViewerModal, openFileViewerModal } from '../store/uiSlice';

const RecentsPage = () => {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.files);
  const { renameModalOpen, fileViewerModalOpen, selectedItem, itemType } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(false);

  // Charger les fichiers récents (tous dossiers confondus, triés par date de modification)
  useEffect(() => {
    const loadRecentFiles = async () => {
      setLoading(true);
      try {
        const filesData = await fileService.getRecentFiles();
        dispatch(setFiles(filesData.files || []));
        await refreshUser(dispatch);
      } catch (error) {
        console.error('Erreur lors du chargement des fichiers récents:', error);
        dispatch(setError('Erreur lors du chargement des fichiers récents'));
      } finally {
        setLoading(false);
      }
    };

    loadRecentFiles();
  }, [dispatch]);

  const breadcrumbs = [
    { label: 'Accueil', path: '/home' },
    { label: 'Récents', path: '/recents' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fichiers récents</h2>
        <p className="text-gray-600">Vos fichiers les plus récemment modifiés</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : (
        <FileView
          folders={[]}
          files={files}
          currentFolder={null}
          breadcrumbs={breadcrumbs}
          defaultSortBy="date"
          defaultSortOrder="desc"
          emptyMessage="Aucun fichier récent"
        />
      )}

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

export default RecentsPage;
