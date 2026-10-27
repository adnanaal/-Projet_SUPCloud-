const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AzureADOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
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

// Configuration de la stratégie Microsoft Azure AD OAuth2
passport.use(
  new AzureADOAuth2Strategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
      resource: '00000003-0000-0000-c000-000000000000', // Microsoft Graph API
      tenant: process.env.MICROSOFT_TENANT_ID || 'common',
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        const email = profile.upn || profile.email;
        const microsoftId = profile.oid;
        const name = profile.displayName || profile.name;
        const avatar = null; // Microsoft ne fournit pas d'avatar par défaut

        // Vérifier si l'utilisateur existe déjà avec cet email
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Si l'utilisateur existe mais n'a pas de microsoftId, le mettre à jour
          if (!user.microsoftId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { microsoftId, avatar: avatar || user.avatar },
            });
          }
        } else {
          // Créer un nouvel utilisateur
          user = await prisma.user.create({
            data: {
              email,
              microsoftId,
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

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((data, done) => {
  done(null, data);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;
