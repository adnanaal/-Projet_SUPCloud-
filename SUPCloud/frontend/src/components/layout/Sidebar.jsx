import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Folder, Trash2, Clock, HardDrive, Settings as SettingsIcon } from 'lucide-react';
import { setSidebarOpen, isDesktopScreen } from '../../store/uiSlice';
import { formatBytes } from '../../utils/formatBytes';
import { getStorageInfo } from '../../utils/storage';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const storage = getStorageInfo(user);

  const navItems = [
    { path: '/home', icon: Home, label: 'Accueil' },
    { path: '/files', icon: Folder, label: 'Mes fichiers' },
    { path: '/recents', icon: Clock, label: 'Récents' },
    { path: '/trash', icon: Trash2, label: 'Corbeille' },
    { path: '/settings', icon: SettingsIcon, label: 'Paramètres' },
  ];

  return (
    <aside
      className={`bg-white/90 backdrop-blur-lg border-r border-gray-200/70 fixed left-0 top-16 bottom-0 z-40 w-64 overflow-y-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!sidebarOpen}
    >
      <nav className="px-3 pt-4 space-y-1">
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
                // Petit écran : refermer le tiroir après avoir choisi une page
                if (!isDesktopScreen()) dispatch(setSidebarOpen(false));
              }}
              className={`group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-brand-700 bg-gradient-to-r from-brand-50 to-brand-100/70 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-500 to-brand-700" />
              )}
              <Icon className={`h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-brand-600' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Indicateur de stockage en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="flex items-center">
            <HardDrive className="h-4 w-4 mr-1" />
            Stockage
          </span>
          <span>{storage.percentLabel}%</span>
        </div>
        <div className="w-full bg-brand-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-500 to-brand-700 h-2 rounded-full transition-all duration-700"
            style={{ width: `${storage.used > 0 ? Math.max(storage.percent, 0.5) : 0}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <span className="font-medium text-gray-700">{formatBytes(storage.used)}</span> utilisés sur {formatBytes(storage.limit)}
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-medium text-green-700">{formatBytes(storage.remaining)}</span> restants
        </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
