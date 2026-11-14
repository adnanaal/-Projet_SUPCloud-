import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FolderPlus,
  Files,
  Folder as FolderIcon,
  HardDrive,
  FileImage,
  FileVideo,
  Music,
  FileText,
  Archive,
  File as FileGeneric,
  ArrowRight,
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import FileCard from '../components/common/FileCard';
import FolderCard from '../components/common/FolderCard';
import UploadModal from '../components/common/UploadModal';
import CreateFolderModal from '../components/common/CreateFolderModal';
import RenameModal from '../components/common/RenameModal';
import FileViewerModal from '../components/common/FileViewerModal';
import { setFiles } from '../store/filesSlice';
import { setFolders } from '../store/foldersSlice';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { refreshUser } from '../utils/refreshUser';
import { formatBytes, formatPercent } from '../utils/formatBytes';
import {
  openUploadModal,
  openCreateFolderModal,
  closeUploadModal,
  closeCreateFolderModal,
  closeRenameModal,
  closeFileViewerModal,
  openFileViewerModal,
} from '../store/uiSlice';

const SUGGESTION_COUNT = 4;
const FOLDER_COUNT = 4;

// Classes Tailwind écrites en toutes lettres pour être détectées à la compilation
const CATEGORY_META = {
  images: { label: 'Images', icon: FileImage, bar: 'bg-pink-500', dot: 'bg-pink-500' },
  videos: { label: 'Vidéos', icon: FileVideo, bar: 'bg-purple-500', dot: 'bg-purple-500' },
  audio: { label: 'Audio', icon: Music, bar: 'bg-amber-500', dot: 'bg-amber-500' },
  documents: { label: 'Documents', icon: FileText, bar: 'bg-blue-500', dot: 'bg-blue-500' },
  archives: { label: 'Archives', icon: Archive, bar: 'bg-teal-500', dot: 'bg-teal-500' },
  others: { label: 'Autres', icon: FileGeneric, bar: 'bg-gray-500', dot: 'bg-gray-500' },
};

const StatCard = ({ icon: Icon, label, value, hint, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="p-2 bg-indigo-50 rounded-lg">
        <Icon size={20} className="text-indigo-600" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </button>
);

const SectionHeader = ({ title, actionLabel, onAction }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {onAction && (
      <button
        onClick={onAction}
        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        {actionLabel}
        <ArrowRight size={16} className="ml-1" />
      </button>
    )}
  </div>
);

const StorageBreakdown = ({ categories, storageUsed, storageLimit }) => {
  const segments = categories.filter((category) => category.size > 0);
  const totalSize = segments.reduce((sum, category) => sum + category.size, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Répartition du stockage</h3>
        <span className="text-sm text-gray-500">
          {formatBytes(storageUsed)} utilisés sur {formatBytes(storageLimit)}
        </span>
      </div>

      <div className="flex w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
        {segments.map((category) => (
          <div
            key={category.key}
            className={`${CATEGORY_META[category.key].bar} h-3`}
            style={{ width: `${(category.size / totalSize) * 100}%` }}
            title={`${CATEGORY_META[category.key].label} : ${formatBytes(category.size)}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const meta = CATEGORY_META[category.key];
          const Icon = meta.icon;
          return (
            <div key={category.key} className="flex items-center space-x-3">
              <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
              <Icon size={16} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{meta.label}</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(category.size)} · {category.count} fichier{category.count > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { files } = useSelector((state) => state.files);
  const { folders } = useSelector((state) => state.folders);
  const { user } = useSelector((state) => state.auth);
  const { uploadModalOpen, createFolderModalOpen, renameModalOpen, fileViewerModalOpen, selectedItem, itemType } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const statsLoaded = useRef(false);

  const loadStats = async () => {
    try {
      setStats(await fileService.getStorageStats());
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Charger le tableau de bord : statistiques, fichiers suggérés et dossiers
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [recentData, foldersData] = await Promise.all([
          fileService.getRecentFiles(),
          folderService.getFolders(),
          loadStats(),
          refreshUser(dispatch),
        ]);
        dispatch(setFiles((recentData.files || []).slice(0, SUGGESTION_COUNT)));
        dispatch(setFolders((foldersData.folders || []).slice(0, FOLDER_COUNT)));
        statsLoaded.current = true;
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Garder les statistiques à jour après une suppression depuis le tableau de bord
  useEffect(() => {
    if (statsLoaded.current) {
      loadStats();
    }
  }, [files.length, folders.length]);

  const storageUsed = Number(user?.storageUsed) || 0;
  const storageLimit = Number(user?.storageLimit) || 32212254720;
  const firstName = (user?.name || '').trim().split(' ')[0] || 'vous';
  const isEmpty = stats && stats.totalFiles === 0 && stats.totalFolders === 0;

  return (
    <MainLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bonjour, {firstName}</h2>
          <p className="text-gray-600">Voici un aperçu de votre espace SUPCloud</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => dispatch(openCreateFolderModal())}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderPlus size={18} className="mr-2" />
            Nouveau dossier
          </button>
          <button
            onClick={() => dispatch(openUploadModal())}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload size={18} className="mr-2" />
            Importer des fichiers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-4">
            <HardDrive className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre espace est vide</h3>
          <p className="text-gray-600 mb-6">
            Importez vos premiers fichiers ou créez un dossier pour organiser vos documents.
          </p>
          <button
            onClick={() => dispatch(openUploadModal())}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload size={18} className="mr-2" />
            Importer des fichiers
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Chiffres clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={Files}
              label="Fichiers"
              value={stats?.totalFiles ?? '–'}
              hint="Voir tous mes fichiers"
              onClick={() => navigate('/files')}
            />
            <StatCard
              icon={FolderIcon}
              label="Dossiers"
              value={stats?.totalFolders ?? '–'}
              hint="Organisez votre espace"
              onClick={() => navigate('/files')}
            />
            <StatCard
              icon={HardDrive}
              label="Espace utilisé"
              value={`${formatPercent(storageUsed, storageLimit)} %`}
              hint={`${formatBytes(storageUsed)} sur ${formatBytes(storageLimit)}`}
              onClick={() => navigate('/files')}
            />
          </div>

          {/* Répartition du stockage par type */}
          {stats && (
            <StorageBreakdown
              categories={stats.categories}
              storageUsed={storageUsed}
              storageLimit={storageLimit}
            />
          )}

          {/* Fichiers suggérés : les plus récemment modifiés */}
          {files.length > 0 && (
            <section>
              <SectionHeader
                title="Suggestions"
                actionLabel="Voir les récents"
                onAction={() => navigate('/recents')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </section>
          )}

          {/* Accès rapide aux dossiers */}
          {folders.length > 0 && (
            <section>
              <SectionHeader
                title="Accès rapide aux dossiers"
                actionLabel="Tous mes fichiers"
                onAction={() => navigate('/files')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

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

export default HomePage;
