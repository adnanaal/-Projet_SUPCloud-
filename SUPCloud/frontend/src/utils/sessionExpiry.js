import axios from 'axios';
import { logout } from '../store/authSlice';

/**
 * Session refusée par le serveur (jeton expiré, invalide ou secret changé) :
 * déconnecter l'utilisateur et le renvoyer vers la page de connexion avec un message.
 * Les autres erreurs 401 (mot de passe actuel incorrect...) ne sont pas concernées.
 */
export const setupSessionExpiry = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data?.code === 'SESSION_INVALID' && store.getState().auth.isAuthenticated) {
        store.dispatch(logout());
        window.location.assign('/login?session=expired');
      }
      return Promise.reject(error);
    }
  );
};
