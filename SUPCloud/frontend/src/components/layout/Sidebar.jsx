import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Folder, Trash2, Plus, Upload, Star, Clock, HardDrive, Settings as SettingsIcon } from 'lucide-react';
import { toggleSidebar, openUploadModal, openCreateFolderModal } from '../../store/uiSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { folders } = useSelector((state) => state.folders);
  const { user } = useSelector((state) => state.auth);

  const handleUpload = () => {
    dispatch(openUploadModal());
  };

  const handleCreateFolder = () => {
    dispatch(openCreateFolderModal());
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const storageUsed = user?.storageUsed ? Number(user.storageUsed) : 0;
  const storageLimit = user?.storageLimit ? Number(user.storageLimit) : 32212254720;
  const storagePercentage = Math.min(100, (storageUsed / storageLimit) * 100);

  const navItems = [
    { path: '/home', icon: Home, label: 'Accueil' },
    { path: '/recents', icon: Clock, label: 'Récents' },
    { path: '/favorites', icon: Star, label: 'Favoris' },
    { path: '/trash', icon: Trash2, label: 'Corbeille' },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className="p-4">
        <button
          onClick={handleUpload}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center space-x-2 transition-colors mb-3"
        >
          <Upload className="h-5 w-5" />
          <span>Uploader</span>
        </button>
        <button
          onClick={handleCreateFolder}
          className="w-full bg-white text-indigo-600 border-2 border-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-indigo-50 flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau dossier</span>
        </button>
      </div>

      {/* Indicateur de stockage */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="flex items-center">
            <HardDrive className="h-4 w-4 mr-1" />
            Stockage
          </span>
          <span>{storagePercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${storagePercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
        </div>
      </div>

      <nav className="px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-8 px-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Dossiers
        </h3>
        <div className="space-y-1">
          {folders.length === 0 ? (
            <p className="text-sm text-gray-500 px-3 py-2">Aucun dossier</p>
          ) : (
            folders.map((folder) => (
              <a
                key={folder.id}
                href={`/folders/${folder.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/folders/${folder.id}`);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Folder className="h-4 w-4 mr-2" />
                <span className="truncate">{folder.name}</span>
              </a>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 px-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Compte
        </h3>
        <a
          href="/settings"
          onClick={(e) => {
            e.preventDefault();
            navigate('/settings');
          }}
          className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          <SettingsIcon className="h-4 w-4 mr-2" />
          <span>Paramètres</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
