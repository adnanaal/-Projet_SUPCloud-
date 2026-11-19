const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const OAuth2Strategy = require('passport-oauth2');
const jwt = require('jsonwebtoken');
const { generateToken } = require('./jwt');
const prisma = require('./database');

// Configuration de la stratégie Google OAuth2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName || profile.name.givenName;
        const avatar = profile.photos[0]?.value;

        // Vérifier si l'utilisateur existe déjà avec cet email
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Si l'utilisateur existe mais n'a pas de googleId, le mettre à jour
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId, avatar: avatar || user.avatar },
            });
          }
        } else {
          // Créer un nouvel utilisateur
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              name,
              avatar,
            },
          });
        }

        // Générer un token JWT
        const token = generateToken({
          id: user.id,
          email: user.email,
          name: user.name,
        });

        // Retourner l'utilisateur avec le token
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Configuration de la stratégie GitHub OAuth2
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const githubId = profile.id.toString();
        const name = profile.displayName || profile.username;
        const avatar = profile.photos[0]?.value;

        // Vérifier si l'utilisateur existe déjà avec cet email
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Si l'utilisateur existe mais n'a pas de githubId, le mettre à jour
          if (!user.githubId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { githubId, avatar: avatar || user.avatar },
            });
          }
        } else {
          // Créer un nouvel utilisateur
          user = await prisma.user.create({
            data: {
              email,
              githubId,
              name,
              avatar,
            },
          });
        }

        // Générer un token JWT
        const token = generateToken({
          id: user.id,
          email: user.email,
          name: user.name,
        });

        // Retourner l'utilisateur avec le token
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Configuration de la stratégie Microsoft (Microsoft Entra ID, points d'accès v2.0 :
// comptes professionnels, scolaires et personnels) - uniquement si configurée
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  const tenant = process.env.MICROSOFT_TENANT_ID || 'common';

  const microsoftStrategy = new OAuth2Strategy(
    {
      authorizationURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    },
    // 5 paramètres : Passport transmet aussi les paramètres de la réponse (dont id_token)
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // Reçu directement de Microsoft (HTTPS, échange de code) : le contenu peut être lu sans revérifier la signature
        const claims = (params && params.id_token && jwt.decode(params.id_token)) || {};
        const email = String(
          claims.email || claims.preferred_username || profile.mail || profile.userPrincipalName || ''
        ).trim();
        const microsoftId = String(profile.id || claims.oid || claims.sub || '');

        if (!email.includes('@') || !microsoftId) {
          return done(new Error("Microsoft n'a fourni ni adresse email ni identifiant utilisateur"), null);
        }

        const name = profile.displayName || claims.name || email.split('@')[0];

        // Vérifier si l'utilisateur existe déjà avec cet email (sans tenir compte de la casse)
        let user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        });

        if (user) {
          // Si l'utilisateur existe mais n'a pas de microsoftId, le mettre à jour
          if (!user.microsoftId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { microsoftId },
            });
          }
        } else {
          // Créer un nouvel utilisateur
          user = await prisma.user.create({
            data: {
              email,
              microsoftId,
              name,
            },
          });
        }

        // Générer un token JWT
        const token = generateToken({
          id: user.id,
          email: user.email,
          name: user.name,
        });

        // Retourner l'utilisateur avec le token
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  );

  // Profil de l'utilisateur via Microsoft Graph (nécessite le scope User.Read)
  microsoftStrategy.userProfile = async (accessToken, done) => {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Microsoft Graph a répondu avec le statut ${response.status}`);
      }

      return done(null, await response.json());
    } catch (error) {
      return done(error);
    }
  };

  // Proposer le choix du compte à chaque connexion
  microsoftStrategy.authorizationParams = () => ({ prompt: 'select_account' });

  passport.use('microsoft', microsoftStrategy);
}

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((data, done) => {
  done(null, data);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;
