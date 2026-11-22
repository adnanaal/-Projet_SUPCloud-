import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { User, Mail, Calendar, Edit, Save, X, Lock, Trash2, AlertTriangle, HardDrive, Link2, KeyRound } from 'lucide-react';
import { updateProfile, changePassword, deleteAccount, createOAuthLinkToken, disconnectOAuth } from '../services/userService';
import { API_BASE_URL } from '../config';
import { addToast } from '../store/uiSlice';
import { updateUser, logout } from '../store/authSlice';
import { refreshUser } from '../utils/refreshUser';
import { formatBytes } from '../utils/formatBytes';
import { getStorageInfo } from '../utils/storage';

const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-6 h-6" fill="#24292f" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 23 23" aria-hidden="true">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

const PROVIDER_LABELS = { google: 'Google', github: 'GitHub', microsoft: 'Microsoft' };

// Messages affichés au retour d'une tentative de rattachement échouée
const LINK_ERRORS = {
  conflict: 'Ce compte est déjà rattaché à un autre compte SUPCloud.',
  already_linked: 'Un autre compte de ce fournisseur est déjà connecté. Déconnectez-le d\'abord.',
  expired: 'La demande a expiré. Veuillez réessayer.',
  failed: 'La connexion avec le fournisseur a échoué. Veuillez réessayer.',
};

// Ligne d'un mode de connexion : fournisseur, état (connecté ou non) et action éventuelle
const ConnectionRow = ({ icon, name, description, connected, action }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3 min-w-0">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
    </div>
    <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          connected ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {connected ? 'Connecté' : 'Non connecté'}
      </span>
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.title}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            action.danger
              ? 'text-red-600 border-red-200 hover:bg-red-50'
              : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const returnHandledRef = useRef(false);
  const [busyProvider, setBusyProvider] = useState('');
  const storage = getStorageInfo(user);

  // Modes de connexion disponibles : mot de passe local et fournisseurs rattachés
  const linkedProviders = user?.linkedProviders || {};
  const connectionCount = (user?.hasPassword === true ? 1 : 0) + Object.values(linkedProviders).filter(Boolean).length;

  const providerAction = (provider) => {
    const connected = Boolean(linkedProviders[provider]);
    if (connected) {
      const isLast = connectionCount <= 1;
      return {
        label: 'Déconnecter',
        danger: true,
        disabled: isLast || busyProvider === provider,
        title: isLast ? 'Dernier mode de connexion : connectez un autre compte avant de le retirer' : undefined,
        onClick: () => handleDisconnectProvider(provider),
      };
    }
    return {
      label: busyProvider === provider ? 'Redirection...' : 'Connecter',
      disabled: Boolean(busyProvider),
      onClick: () => handleLinkProvider(provider),
    };
  };

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

  // Retour du fournisseur après une tentative de rattachement : message puis nettoyage de l'adresse
  useEffect(() => {
    // Traiter le retour une seule fois (React.StrictMode exécute les effets deux fois en développement)
    if (returnHandledRef.current) return;
    returnHandledRef.current = true;

    const linked = searchParams.get('linked');
    const oauthError = searchParams.get('oauth') === 'error';

    if (linked && PROVIDER_LABELS[linked]) {
      dispatch(addToast({ message: `Compte ${PROVIDER_LABELS[linked]} connecté avec succès`, type: 'success' }));
      refreshUser(dispatch);
    } else if (oauthError) {
      dispatch(addToast({ message: LINK_ERRORS[searchParams.get('reason')] || LINK_ERRORS.failed, type: 'error' }));
    }

    if (linked || oauthError) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Connecter un compte : jeton de rattachement puis redirection vers le fournisseur
  const handleLinkProvider = async (provider) => {
    setBusyProvider(provider);
    try {
      const linkToken = await createOAuthLinkToken(token, provider);
      window.location.href = `${API_BASE_URL}/auth/${provider}?link=${encodeURIComponent(linkToken)}`;
    } catch (error) {
      setBusyProvider('');
      dispatch(addToast({
        message: error.response?.data?.message || 'Impossible de démarrer la connexion avec ce fournisseur',
        type: 'error',
      }));
    }
  };

  // Déconnecter un compte (un autre mode de connexion doit rester disponible)
  const handleDisconnectProvider = async (provider) => {
    if (!window.confirm(`Déconnecter votre compte ${PROVIDER_LABELS[provider]} ? Vous ne pourrez plus l'utiliser pour vous connecter.`)) {
      return;
    }

    setBusyProvider(provider);
    try {
      const response = await disconnectOAuth(token, provider);
      dispatch(updateUser(response.user));
      dispatch(addToast({ message: response.message, type: 'success' }));
    } catch (error) {
      dispatch(addToast({
        message: error.response?.data?.message || 'Erreur lors de la déconnexion',
        type: 'error',
      }));
    } finally {
      setBusyProvider('');
    }
  };

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

        {/* Comptes connectés : modes de connexion rattachés à ce compte */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Link2 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Comptes connectés</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Ces modes de connexion donnent accès au même compte SUPCloud. Connectez un compte Google, GitHub ou
            Microsoft (même avec une adresse email différente) pour l'utiliser à la connexion. Avec une adresse email
            identique à celle de votre compte, le rattachement se fait aussi automatiquement à la première connexion.
          </p>

          <div className="space-y-3" data-testid="linked-accounts">
            <ConnectionRow
              icon={<KeyRound className="h-6 w-6 text-indigo-600" />}
              name="Email et mot de passe"
              description={user?.email || ''}
              connected={user?.hasPassword === true}
            />
            <ConnectionRow
              icon={<GoogleIcon />}
              name="Google"
              description="Connexion avec votre compte Google"
              connected={Boolean(linkedProviders.google)}
              action={providerAction('google')}
            />
            <ConnectionRow
              icon={<GitHubIcon />}
              name="GitHub"
              description="Connexion avec votre compte GitHub"
              connected={Boolean(linkedProviders.github)}
              action={providerAction('github')}
            />
            <ConnectionRow
              icon={<MicrosoftIcon />}
              name="Microsoft"
              description="Connexion avec votre compte Microsoft"
              connected={Boolean(linkedProviders.microsoft)}
              action={providerAction('microsoft')}
            />
          </div>
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
