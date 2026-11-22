const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const OAuth2Strategy = require('passport-oauth2');
const jwt = require('jsonwebtoken');
const { verifyLinkToken } = require('./jwt');
const { handleOAuthProfile } = require('../utils/oauthAccount');

/**
 * Détermine si la requête de retour du fournisseur est un rattachement (et non une connexion) :
 * le paramètre « state » contient alors le jeton de rattachement émis pour l'utilisateur connecté.
 * Retourne l'identifiant de l'utilisateur, ou null pour une connexion normale.
 */
const getLinkUserId = (req, provider) => {
  const state = req.query && req.query.state;
  if (!state) return null;

  try {
    return verifyLinkToken(String(state), provider).userId;
  } catch (error) {
    const expired = new Error('La demande de rattachement a expiré ou est invalide');
    expired.code = 'LINK_EXPIRED';
    throw expired;
  }
};

// Configuration de la stratégie Google OAuth2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const linkUserId = getLinkUserId(req, 'google');
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email && !linkUserId) {
          return done(new Error("Google n'a fourni aucune adresse email"), null);
        }

        const result = await handleOAuthProfile(
          'google',
          {
            providerId: profile.id,
            email,
            name: profile.displayName || (profile.name && profile.name.givenName),
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          },
          linkUserId
        );

        return done(null, result);
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
      // Sans ce scope déclaré ici, la bibliothèque ne récupère pas /user/emails
      // (indispensable quand l'email du compte GitHub est privé)
      scope: ['user:email'],
      // Garder tous les emails avec leurs indicateurs primary et verified
      allRawEmails: true,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const linkUserId = getLinkUserId(req, 'github');

        // Email principal et vérifié en priorité (la liste renvoyée par GitHub n'est pas triée)
        const emails = profile.emails || [];
        const emailEntry =
          emails.find((entry) => entry.primary && entry.verified) ||
          emails.find((entry) => entry.verified) ||
          emails[0];
        const email = emailEntry && emailEntry.value;

        if (!email && !linkUserId) {
          return done(new Error("GitHub n'a fourni aucune adresse email (scope user:email requis)"), null);
        }

        const result = await handleOAuthProfile(
          'github',
          {
            providerId: profile.id,
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          },
          linkUserId
        );

        return done(null, result);
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
      passReqToCallback: true,
    },
    // 6 paramètres : Passport transmet la requête et les paramètres de la réponse (dont id_token)
    async (req, accessToken, refreshToken, params, profile, done) => {
      try {
        const linkUserId = getLinkUserId(req, 'microsoft');

        // Reçu directement de Microsoft (HTTPS, échange de code) : le contenu peut être lu sans revérifier la signature
        const claims = (params && params.id_token && jwt.decode(params.id_token)) || {};
        const email = String(
          claims.email || claims.preferred_username || profile.mail || profile.userPrincipalName || ''
        ).trim();
        const microsoftId = String(profile.id || claims.oid || claims.sub || '');

        if (!microsoftId || (!email.includes('@') && !linkUserId)) {
          return done(new Error("Microsoft n'a fourni ni adresse email ni identifiant utilisateur"), null);
        }

        const result = await handleOAuthProfile(
          'microsoft',
          {
            providerId: microsoftId,
            email: email.includes('@') ? email : null,
            name: profile.displayName || claims.name || email.split('@')[0],
          },
          linkUserId
        );

        return done(null, result);
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
