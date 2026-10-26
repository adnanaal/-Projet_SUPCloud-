import React from 'react';
import { useSelector } from 'react-redux';
import { File, Folder, Upload, Plus } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const HomePage = () => {
  const { files } = useSelector((state) => state.files);
  const { folders } = useSelector((state) => state.folders);
  const { user } = useSelector((state) => state.auth);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const storageUsed = user?.storageUsed ? Number(user.storageUsed) : 0;
  const storageLimit = user?.storageLimit ? Number(user.storageLimit) : 32212254720; // 30 Go

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

      {/* Section fichiers récents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fichiers récents</h3>
        </div>
        <div className="p-6">
          {files.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <File className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Aucun fichier pour le moment</p>
              <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Uploader un fichier</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {files.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(Number(file.size))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
