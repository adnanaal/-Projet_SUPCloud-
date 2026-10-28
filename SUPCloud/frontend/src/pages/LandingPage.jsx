import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Folder, 
  Lock, 
  Share2, 
  Upload, 
  Download,
  Shield,
  Zap
} from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header avec boutons */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <img
                src="/supcloud.png"
                alt="SUPCloud"
                className="h-10"
              />
              {/* Boutons Sign In et Sign Up */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Votre Stockage Cloud
            <span className="text-indigo-600"> Sécurisé</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            SUPCloud est votre solution de stockage cloud sécurisée, rapide et facile à utiliser. 
            Stockez, partagez et accédez à vos fichiers partout dans le monde.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
            >
              Commencer Gratuitement
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-lg"
            >
              Se Connecter
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir SUPCloud ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Cloud className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Stockage Cloud</h3>
              <p className="text-gray-600">
                30 Go d'espace de stockage gratuit pour tous vos fichiers
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurité Avancée</h3>
              <p className="text-gray-600">
                Chiffrement de bout en bout pour protéger vos données
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ultra Rapide</h3>
              <p className="text-gray-600">
                Upload et téléchargement à grande vitesse
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Share2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Partage Facile</h3>
              <p className="text-gray-600">
                Partagez vos fichiers avec qui vous voulez en un clic
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features détaillées */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                <Folder className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Gestion de Dossiers</h3>
              </div>
              <p className="text-gray-600">
                Organisez vos fichiers dans une structure de dossiers hiérarchique intuitive. 
                Créez, renommez, déplacez et supprimez vos dossiers facilement.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                <Upload className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Upload Simplifié</h3>
              </div>
              <p className="text-gray-600">
                Uploadez vos fichiers avec une barre de progression en temps réel. 
                Supporte tous les types de fichiers jusqu'à 100 Mo.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                <Download className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Téléchargement Rapide</h3>
              </div>
              <p className="text-gray-600">
                Téléchargez vos fichiers individuellement ou en ZIP pour les dossiers. 
                Accès instantané à tous vos documents.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Authentification Sécurisée</h3>
              </div>
              <p className="text-gray-600">
                Connexion sécurisée avec email/mot de passe ou OAuth2 (Google, GitHub). 
                Vos données sont toujours protégées.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                <Share2 className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Partage de Fichiers</h3>
              </div>
              <p className="text-gray-600">
                Partagez vos fichiers avec d'autres utilisateurs via des liens sécurisés. 
                Contrôlez l'accès et les permissions.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Corbeille & Récupération</h3>
              </div>
              <p className="text-gray-600">
                Les fichiers supprimés vont dans la corbeille pendant 30 jours. 
                Récupérez-les facilement en cas d'erreur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à SUPCloud pour stocker leurs fichiers.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-lg"
          >
            Créer un compte gratuit
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <img
            src="/supcloud.png"
            alt="SUPCloud"
            className="h-10 mx-auto mb-4"
          />
          <p className="text-gray-400 mb-4">
            Votre solution de stockage cloud sécurisée et rapide
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 SUPCloud. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
