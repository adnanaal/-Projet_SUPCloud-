import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { User, Mail, Calendar, Edit, Save, X, Lock, Trash2, AlertTriangle, HardDrive } from 'lucide-react';
import { updateProfile, changePassword, deleteAccount } from '../services/userService';
import { addToast } from '../store/uiSlice';
import { updateUser, logout } from '../store/authSlice';
import { refreshUser } from '../utils/refreshUser';
import { formatBytes } from '../utils/formatBytes';
import { getStorageInfo } from '../utils/storage';

const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const storage = getStorageInfo(user);

  // Compte OAuth2 sans mot de passe local : pas de changement de mot de passe possible
  const hasPassword = user?.hasPassword !== false;

  // États pour l'édition des informations personnelles
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileError, setProfileError] = useState('');

  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // États pour la suppression de compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Rafraîchir l'utilisateur (stockage, type de compte) à l'ouverture de la page
  useEffect(() => {
    refreshUser(dispatch);
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleProfileEdit = () => {
    setProfileData({ name: user?.name || '', email: user?.email || '' });
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleProfileSave = async () => {
    setProfileError('');

    try {
      const response = await updateProfile(token, profileData);
      dispatch(updateUser(response.user));
      dispatch(addToast({ message: 'Informations mises à jour avec succès', type: 'success' }));
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Erreur lors de la mise à jour des informations');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(token, passwordData.currentPassword, passwordData.newPassword);
      dispatch(addToast({ message: 'Mot de passe modifié avec succès', type: 'success' }));
      setPasswordData(EMPTY_PASSWORD_FORM);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteOpen = () => {
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    setDeleteError('');

    try {
      await deleteAccount(token, deletePassword);
      dispatch(addToast({ message: 'Compte supprimé avec succès', type: 'success' }));
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Erreur lors de la suppression du compte');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h2>
          <p className="text-gray-600">Gérez votre compte, votre mot de passe et votre espace de stockage</p>
        </div>

        {/* Stockage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Stockage</h3>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${storage.used > 0 ? Math.max(storage.percent, 0.5) : 0}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Utilisé</p>
              <p className="text-lg font-semibold text-gray-900">{formatBytes(storage.used)}</p>
              <p className="text-xs text-gray-500">{storage.percentLabel} % du quota</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Restant</p>
              <p className="text-lg font-semibold text-green-700">{formatBytes(storage.remaining)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quota total</p>
              <p className="text-lg font-semibold text-gray-900">{formatBytes(storage.limit)}</p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            {!isEditingProfile && (
              <button
                onClick={handleProfileEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit size={16} />
                <span>Modifier</span>
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {profileError}
                </div>
              )}

              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleProfileSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save size={16} />
                  <span>Enregistrer</span>
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={16} />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium text-gray-900">{user?.name || 'Non disponible'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email || 'Non disponible'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Membre depuis</p>
                  <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mot de passe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Mot de passe</h3>
          </div>

          {hasPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {passwordError}
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={inputClass}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{passwordLoading ? 'Enregistrement...' : 'Modifier le mot de passe'}</span>
              </button>
            </form>
          ) : (
            <p className="text-gray-600">
              Votre compte est connecté via un service tiers (Google, GitHub ou Microsoft) : il n'a pas de mot de passe SUPCloud à modifier.
            </p>
          )}
        </div>

        {/* Zone de danger */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h3>
          <p className="text-gray-600 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
          </p>
          <button
            onClick={handleDeleteOpen}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            <span>Supprimer mon compte</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Supprimer votre compte</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données (fichiers, dossiers, paramètres) seront définitivement supprimées.
            </p>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {deleteError}
              </div>
            )}

            {hasPassword && (
              <div className="mb-4">
                <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  id="delete-password"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer définitivement
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SettingsPage;
