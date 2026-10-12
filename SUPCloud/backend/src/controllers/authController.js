const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');
const prisma = require('../config/database');

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation basique
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email, mot de passe et nom sont requis',
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Utilisateur existe déjà',
        message: 'Un utilisateur avec cet email existe déjà',
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Générer le token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'inscription',
    });
  }
};

/**
 * Connexion d'un utilisateur
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation basique
    if (!email || !password) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email et mot de passe sont requis',
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier si l'utilisateur a un mot de passe (pas OAuth2)
    if (!user.password) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Ce compte utilise OAuth2. Veuillez vous connecter via Google ou GitHub.',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Générer le token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Connexion réussie',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la connexion',
    });
  }
};

/**
 * Déconnexion d'un utilisateur
 */
const logout = (req, res) => {
  // Pour une implémentation simple, on retourne juste un message
  // Dans une implémentation plus avancée, on pourrait gérer un blacklist de tokens
  res.status(200).json({
    message: 'Déconnexion réussie',
  });
};

/**
 * Obtenir les informations de l'utilisateur connecté
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        storageUsed: true,
        storageLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur introuvable',
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des informations',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
