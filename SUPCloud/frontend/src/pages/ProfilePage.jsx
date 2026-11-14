import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { User, Mail, Calendar, Shield, Edit, Save, X, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { updateProfile, changePassword, deleteAccount } from '../services/userService';
import { addToast } from '../store/uiSlice';
import { updateUser, logout } from '../store/authSlice';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileError, setProfileError] = useState('');

  // États pour le changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // États pour la suppression de compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleProfileEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileError('');
  };

  const handleProfileSave = async () => {
    setProfileError('');

    try {
      const response = await updateProfile(token, profileData);
      dispatch(updateUser(response.user));
      dispatch(addToast({
        message: 'Profil mis à jour avec succès',
        type: 'success'
      }));
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setIsChangingPassword(true);
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordError('');
  };

  const handlePasswordSave = async () => {
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await changePassword(token, passwordData.currentPassword, passwordData.newPassword);
      dispatch(addToast({
        message: 'Mot de passe changé avec succès',
        type: 'success'
      }));
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const handleDeleteAccount = () => {
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
      dispatch(addToast({
        message: 'Compte supprimé avec succès',
        type: 'success'
      }));
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil</h2>
          <p className="text-gray-600">Informations de votre compte</p>
        </div>

        {/* Carte profil */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  onClick={handleProfileCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={16} />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium text-gray-900">{user?.name || 'Non disponible'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email || 'Non disponible'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Membre depuis</p>
                    <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Statut du compte</p>
                    <p className="font-medium text-green-600">Actif</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">ID utilisateur</p>
                    <p className="font-medium text-gray-900 text-sm">{user?.id || 'Non disponible'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carte mot de passe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Mot de passe</h3>
            {!isChangingPassword && (
              <button
                onClick={handlePasswordChange}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Lock size={16} />
                <span>Changer</span>
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePasswordSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save size={16} />
                  <span>Changer le mot de passe</span>
                </button>
                <button
                  onClick={handlePasswordCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={16} />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Pour changer votre mot de passe, cliquez sur le bouton "Changer" ci-dessus.
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
            onClick={handleDeleteAccount}
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

            {user?.password && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  type="password"
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

export default ProfilePage;
