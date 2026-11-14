import { getMe } from '../services/userService';
import { updateUser } from '../store/authSlice';

export const refreshUser = async (dispatch) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const { user } = await getMe(token);
    dispatch(updateUser(user));
  } catch (error) {
    console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error);
  }
};
