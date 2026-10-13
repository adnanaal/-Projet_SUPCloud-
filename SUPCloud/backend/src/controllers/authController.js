const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');
const prisma = require('../config/database');

/**
 * Classe d'erreur personnalisée pour les erreurs d'application
 */
class AppError extends Error {
  constructor(statusCode, message, name = 'AppError') {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
  }
}

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation basique
    if (!email || !password || !name) {
      throw new AppError(400, 'Email, mot de passe et nom sont requis', 'ValidationError');
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(400, 'Format d\'email invalide', 'ValidationError');
    }

    // Validation du mot de passe
    if (password.length < 6) {
      throw new AppError(400, 'Le mot de passe doit contenir au moins 6 caractères', 'ValidationError');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Un utilisateur avec cet email existe déjà', 'ConflictError');
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
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation basique
    if (!email || !password) {
      throw new AppError(400, 'Email et mot de passe sont requis', 'ValidationError');
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Email ou mot de passe incorrect', 'AuthenticationError');
    }

    // Vérifier si l'utilisateur a un mot de passe (pas OAuth2)
    if (!user.password) {
      throw new AppError(401, 'Ce compte utilise OAuth2. Veuillez vous connecter via Google ou GitHub.', 'AuthenticationError');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Email ou mot de passe incorrect', 'AuthenticationError');
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
    next(error);
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
const getMe = async (req, res, next) => {
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
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
