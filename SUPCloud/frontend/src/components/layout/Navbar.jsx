import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, User, Plus, File, FolderPlus } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { openUploadModal, openCreateFolderModal } from '../../store/uiSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNewFile = () => {
    dispatch(openUploadModal());
    setShowDropdown(false);
  };

  const handleNewFolder = () => {
    dispatch(openCreateFolderModal());
    setShowDropdown(false);
  };

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/home')}
              className="cursor-pointer focus:outline-none"
            >
              <img
                src="/supcloud.png"
                alt="SUPCloud"
                className="h-10"
              />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Rechercher des fichiers et dossiers..."
              />
            </div>
          </div>

          {/* Bouton Nouveau avec dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors mr-4"
            >
              <Plus className="h-6 w-6" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleNewFile}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <File className="h-5 w-5 mr-3" />
                  <span>Nouveau fichier</span>
                </button>
                <button
                  onClick={handleNewFolder}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FolderPlus className="h-5 w-5 mr-3" />
                  <span>Nouveau dossier</span>
                </button>
              </div>
            )}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'Utilisateur'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
