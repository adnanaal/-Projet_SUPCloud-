import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil</h2>
          <p className="text-gray-600">Informations de votre compte</p>
        </div>

        {/* Lien vers les paramètres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <p className="text-gray-600 mb-2">Pour modifier vos préférences et votre mot de passe, allez dans les paramètres.</p>
          <button
            onClick={() => navigate('/settings')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Aller aux paramètres →
          </button>
        </div>

        {/* Carte profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user?.name || 'Utilisateur'}</h3>
              <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email || 'Non disponible'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Statut du compte</p>
                <p className="font-medium text-green-600">Actif</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">ID utilisateur</p>
                <p className="font-medium text-gray-900 text-sm">{user?.id || 'Non disponible'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connexions OAuth2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connexions OAuth2</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Google</p>
                  <p className="text-sm text-gray-500">
                    {user?.googleId ? 'Connecté' : 'Non connecté'}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${user?.googleId ? 'text-green-600' : 'text-gray-500'}`}>
                {user?.googleId ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GH</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">GitHub</p>
                  <p className="text-sm text-gray-500">
                    {user?.githubId ? 'Connecté' : 'Non connecté'}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${user?.githubId ? 'text-green-600' : 'text-gray-500'}`}>
                {user?.githubId ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Microsoft</p>
                  <p className="text-sm text-gray-500">
                    {user?.microsoftId ? 'Connecté' : 'Non connecté'}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${user?.microsoftId ? 'text-green-600' : 'text-gray-500'}`}>
                {user?.microsoftId ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
