import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    // Le retour OAuth2 ne doit être traité qu'une fois : sinon la seconde exécution (StrictMode),
    // qui ne retrouve plus les paramètres dans l'URL, renverrait vers la page de connexion
    if (handledRef.current) return;
    handledRef.current = true;

    // Récupérer les données de l'authentification OAuth2 depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    const token = params.get('token');

    if (user && token) {
      try {
        const userData = JSON.parse(user);
        dispatch(loginSuccess({ user: userData, token }));
        navigate('/home');
      } catch (error) {
        console.error('Erreur lors du traitement du callback OAuth2:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Traitement de la connexion...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
