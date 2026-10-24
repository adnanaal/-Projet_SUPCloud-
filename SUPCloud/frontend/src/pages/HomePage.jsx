import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  File, 
  Upload, 
  Trash2, 
  Settings, 
  LogOut,
  Search,
  Plus
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation supérieure */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">SUPCloud</h1>
              </div>
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

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Paramètres"
              >
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <div className="p-4">
            <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center space-x-2 transition-colors">
              <Upload className="h-5 w-5" />
              <span>Uploader</span>
            </button>
          </div>

          <nav className="px-2 space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg"
            >
              <Home className="h-5 w-5 mr-3" />
              <span className="font-medium">Accueil</span>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Folder className="h-5 w-5 mr-3" />
              <span>Mes fichiers</span>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5 mr-3" />
              <span>Corbeille</span>
            </a>
          </nav>

          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Dossiers
            </h3>
            <div className="space-y-1">
              <a
                href="#"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Folder className="h-4 w-4 mr-2" />
                <span>Documents</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Folder className="h-4 w-4 mr-2" />
                <span>Images</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Folder className="h-4 w-4 mr-2" />
                <span>Vidéos</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Zone principale */}
        <main className="flex-1 ml-64 p-8">
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
                  <p className="text-2xl font-bold text-gray-900">0</p>
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
                  <p className="text-2xl font-bold text-gray-900">0</p>
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
                  <p className="text-2xl font-bold text-gray-900">0 Go</p>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
