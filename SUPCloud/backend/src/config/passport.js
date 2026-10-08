const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Configuration de la stratégie Google OAuth2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Cette fonction sera implémentée plus tard avec Prisma
      // Pour l'instant, on retourne le profil
      try {
        return done(null, profile);
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
      // Cette fonction sera implémentée plus tard avec Prisma
      // Pour l'instant, on retourne le profil
      try {
        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
