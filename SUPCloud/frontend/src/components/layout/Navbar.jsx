import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { toggleSidebar } from '../../store/uiSlice';
import SearchBar from './SearchBar';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="px-2 sm:px-4 lg:px-6 h-full">
        <div className="flex justify-between items-center h-full gap-2">
          {/* Bouton du menu latéral + logo */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 mr-1 sm:mr-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Afficher ou masquer le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigate('/home')}
              className="cursor-pointer focus:outline-none"
            >
              <img
                src="/supcloud.png"
                alt="SUPCloud"
                className="h-8 sm:h-10"
              />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 min-w-0 max-w-xl sm:mx-4 lg:mx-8">
            <SearchBar />
          </div>

          {/* Menu utilisateur */}
          <div className="relative flex-shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Menu utilisateur"
              className="flex items-center space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[10rem] truncate">
                {user?.name || 'Utilisateur'}
              </span>
            </button>

            {/* Dropdown menu utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
