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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-sky-50 flex items-center justify-center">
      <div className="text-center animate-scale-in">
        <div className="relative mx-auto h-20 w-20">
          <span className="absolute inset-0 rounded-full bg-brand-400/30 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
          <img src="/supcloud.png" alt="" className="absolute inset-0 m-auto h-9 w-auto" />
        </div>
        <p className="mt-6 font-medium text-gray-700">Connexion en cours...</p>
        <p className="mt-1 text-sm text-gray-500">Vous allez être redirigé vers votre espace</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
