import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/userService';
import MainLayout from '../components/layout/MainLayout';

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Les nouveaux mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      await changePassword(token, passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Mot de passe changé avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Gérez votre compte et vos préférences</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Lien vers le profil */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations utilisateur</h2>
          <p className="text-gray-600 mb-4">Pour voir et modifier vos informations personnelles, visitez votre profil.</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Voir mon profil
          </button>
        </div>

        {/* Changement de mot de passe */}
        {user?.password && (
          <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Changer le mot de passe</h2>

              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}

        </div>
      </MainLayout>
  );
};

export default SettingsPage;
