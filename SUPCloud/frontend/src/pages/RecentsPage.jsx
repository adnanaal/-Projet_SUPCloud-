import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Clock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import FileList from '../components/common/FileList';
import RenameModal from '../components/common/RenameModal';
import FileViewerModal from '../components/common/FileViewerModal';
import { setFiles, setError } from '../store/filesSlice';
import { fileService } from '../services/fileService';
import { refreshUser } from '../utils/refreshUser';
import { groupByPeriod } from '../utils/dateGroups';
import { closeRenameModal, closeFileViewerModal, openFileViewerModal } from '../store/uiSlice';

const RecentsPage = () => {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.files);
  const { renameModalOpen, fileViewerModalOpen, selectedItem, itemType } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(false);

  // Charger les fichiers récents (tous dossiers confondus, du plus récent au plus ancien)
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

  const groups = groupByPeriod(files);

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Récents</h2>
        <p className="text-gray-600">Les fichiers que vous avez modifiés ou ajoutés récemment, tous dossiers confondus</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Aucun fichier récent</p>
          <p className="text-sm text-gray-500">Les fichiers que vous ajoutez apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                {group.label}
              </h3>
              <FileList files={group.items} variant="recent" />
            </section>
          ))}
        </div>
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
