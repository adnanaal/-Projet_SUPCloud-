import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Folder, Trash2, Star, Clock, HardDrive, Settings as SettingsIcon } from 'lucide-react';
import { toggleSidebar } from '../../store/uiSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

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
    { path: '/files', icon: Folder, label: 'Fichiers' },
    { path: '/recents', icon: Clock, label: 'Récents' },
    { path: '/favorites', icon: Star, label: 'Favoris' },
    { path: '/trash', icon: Trash2, label: 'Corbeille' },
    { path: '/settings', icon: SettingsIcon, label: 'Paramètres' },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}
    >
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

      {/* Indicateur de stockage en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
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
    </aside>
  );
};

export default Sidebar;
