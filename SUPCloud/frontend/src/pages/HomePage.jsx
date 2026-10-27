import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { File, Folder, Upload, Plus } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import FileView from '../components/common/FileView';
import { setFiles, setLoading, setError } from '../store/filesSlice';
import { setFolders } from '../store/foldersSlice';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';

const HomePage = () => {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.files);
  const { folders } = useSelector((state) => state.folders);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const storageUsed = user?.storageUsed ? Number(user.storageUsed) : 0;
  const storageLimit = user?.storageLimit ? Number(user.storageLimit) : 32212254720; // 30 Go

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
    { label: 'Accueil', path: '/home' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accueil</h2>
        <p className="text-gray-600">Bienvenue sur SUPCloud</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Fichiers</p>
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Folder className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Dossiers</p>
              <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Stockage utilisé</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatBytes(storageUsed)}
              </p>
            </div>
          </div>
        </div>
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
    </MainLayout>
  );
};

export default HomePage;
