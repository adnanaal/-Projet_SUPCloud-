import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  ArchiveRestore,
  CheckCircle2,
  Cloud,
  Eye,
  FileArchive,
  FileText,
  Film,
  Fingerprint,
  Folder,
  FolderTree,
  HardDrive,
  Home,
  Image,
  KeyRound,
  Laptop,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#fonctionnement', label: 'Comment ça marche' },
  { href: '#securite', label: 'Sécurité' },
];

const FEATURES = [
  {
    icon: UploadCloud,
    title: 'Import multiple avec progression',
    text: 'Glissez-déposez plusieurs fichiers à la fois et suivez la progression de chacun en temps réel. Tous les formats sont acceptés.',
    color: 'from-brand-500 to-sky-500',
  },
  {
    icon: FolderTree,
    title: 'Dossiers et glisser-déposer',
    text: "Organisez vos fichiers en arborescence et déplacez-les d'un geste vers un dossier ou via le fil d'Ariane.",
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Eye,
    title: 'Aperçu intégré',
    text: "Images, vidéos, PDF, audio et fichiers texte s'ouvrent directement dans le navigateur, sans téléchargement.",
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: FileArchive,
    title: 'Dossiers en un ZIP',
    text: 'Téléchargez un dossier complet en une seule archive ZIP, générée à la volée par le serveur.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: ArchiveRestore,
    title: 'Corbeille de 30 jours',
    text: 'Une erreur ? Restaurez vos fichiers et dossiers supprimés pendant 30 jours, arborescence comprise.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Search,
    title: 'Recherche instantanée',
    text: "Retrouvez n'importe quel fichier ou dossier en quelques lettres, avec des suggestions pendant la saisie.",
    color: 'from-rose-500 to-pink-500',
  },
];

const STATS = [
  { value: 30, suffix: ' Go', label: "d'espace offert à chaque compte" },
  { value: 5, suffix: '', label: "types de fichiers prévisualisés (images, vidéos, PDF, texte, audio)" },
  { value: 30, suffix: ' jours', label: 'pour restaurer un élément supprimé' },
  { value: 3, suffix: '', label: 'comptes de connexion : Google, GitHub, Microsoft' },
];

const STEPS = [
  {
    icon: Fingerprint,
    title: 'Créez votre compte',
    text: 'En quelques secondes, avec votre email ou votre compte Google, GitHub ou Microsoft.',
  },
  {
    icon: UploadCloud,
    title: 'Importez vos fichiers',
    text: 'Glissez-les dans la fenêtre : ils sont rangés dans vos dossiers, dans la limite de vos 30 Go.',
  },
  {
    icon: Laptop,
    title: 'Retrouvez-les partout',
    text: "Ordinateur, tablette ou téléphone : l'interface s'adapte à chaque écran.",
  },
];

const SECURITY_POINTS = [
  { icon: KeyRound, text: 'Mots de passe hachés avec bcrypt, jamais stockés en clair' },
  { icon: Fingerprint, text: 'Connexion OAuth2 avec Google, GitHub ou Microsoft' },
  { icon: Timer, text: 'Sessions signées (JWT) qui expirent automatiquement' },
  { icon: ShieldCheck, text: 'Tentatives de connexion en série bloquées' },
  { icon: LockKeyhole, text: "Vos fichiers ne sont accessibles qu'à vous, après authentification" },
];

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const MicrosoftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 23 23" aria-hidden="true">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

/**
 * Fait apparaître les éléments [data-reveal] du conteneur quand ils entrent dans l'écran
 * (délai facultatif en millisecondes avec data-delay)
 */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const elements = ref.current ? Array.from(ref.current.querySelectorAll('[data-reveal]')) : [];
    elements.forEach((el) => {
      el.classList.add('reveal');
      if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
    });
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
};

/** Compteur animé de 0 à la valeur cible, lancé quand il devient visible */
const CountUp = ({ value, suffix }) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduceMotion || typeof IntersectionObserver === 'undefined') {
      setCurrent(value);
      return undefined;
    }
    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / 1400, 1);
        setCurrent(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref}>
      {current}
      {suffix}
    </span>
  );
};

/** Aperçu animé de l'application dans la section d'accroche */
const AppPreview = () => {
  const files = [
    { icon: FileText, name: 'Rapport annuel.pdf', meta: '2,4 Mo', tint: 'bg-rose-100 text-rose-600' },
    { icon: Image, name: 'Vacances.jpg', meta: '3,1 Mo', tint: 'bg-sky-100 text-sky-600' },
    { icon: Film, name: 'Présentation.mp4', meta: '48 Mo', tint: 'bg-sky-100 text-sky-600' },
    { icon: Folder, name: 'Projets 2026', meta: '12 fichiers', tint: 'bg-brand-100 text-brand-600' },
  ];
  const navItems = [
    { icon: Home, label: 'Accueil', active: true },
    { icon: Folder, label: 'Mes fichiers' },
    { icon: Timer, label: 'Récents' },
    { icon: Trash2, label: 'Corbeille' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-brand-500/20 via-sky-500/10 to-sky-400/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-2xl shadow-brand-500/10 backdrop-blur">
        {/* Barre de fenêtre */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-gray-400 ring-1 ring-gray-200">
            <Search className="h-3.5 w-3.5" />
            Rechercher...
          </div>
        </div>

        <div className="flex">
          {/* Menu latéral */}
          <div className="hidden w-36 flex-shrink-0 border-r border-gray-100 p-3 sm:block">
            {navItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-gray-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
            <div className="mt-6 rounded-lg bg-gray-50 p-2">
              <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-gray-500">
                <HardDrive className="h-3 w-3" /> Stockage
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-brand-500 to-sky-500" />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">11,4 Go sur 30 Go</p>
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 p-4">
            <p className="text-sm font-semibold text-gray-900">Bonjour, Camille</p>
            <p className="mb-3 text-[11px] text-gray-400">Voici un aperçu de votre espace</p>
            <div className="grid grid-cols-2 gap-2.5">
              {files.map(({ icon: Icon, name, meta, tint }, index) => (
                <div
                  key={name}
                  className="animate-fade-up rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
                  style={{ animationDelay: `${600 + index * 150}ms` }}
                >
                  <div className={`mb-2 inline-flex rounded-lg p-1.5 ${tint}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="truncate text-[11px] font-medium text-gray-800">{name}</p>
                  <p className="text-[10px] text-gray-400">{meta}</p>
                </div>
              ))}
            </div>

            {/* Import en cours */}
            <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-brand-700">
                  <UploadCloud className="h-3.5 w-3.5" /> Import de budget-2026.xlsx
                </span>
                <span className="text-brand-500">en cours</span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full animate-progress rounded-full bg-gradient-to-r from-brand-500 to-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications flottantes */}
      <div className="absolute -left-8 -top-7 hidden animate-float items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg md:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <span>
          <span className="block font-semibold text-gray-800">Projets 2026.zip</span>
          <span className="text-gray-400">prêt à télécharger</span>
        </span>
      </div>
      <div
        className="absolute -right-4 bottom-10 hidden animate-float-slow items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg md:flex"
        style={{ animationDelay: '1.5s' }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ArchiveRestore className="h-4 w-4" />
        </span>
        <span>
          <span className="block font-semibold text-gray-800">Fichier restauré</span>
          <span className="text-gray-400">depuis la corbeille</span>
        </span>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageRef = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const primaryAction = isAuthenticated
    ? { label: 'Ouvrir mon espace', to: '/home' }
    : { label: 'Créer mon compte gratuit', to: '/register' };

  return (
    <div ref={pageRef} className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* En-tête */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen ? 'border-b border-gray-200/70 bg-white/85 shadow-sm backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#haut" className="flex items-center" aria-label="SUPCloud, haut de page">
            <img src="/supcloud.png" alt="SUPCloud" className="h-11" />
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-600">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/home')}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
              >
                Ouvrir mon espace
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-brand-600">
                  Se connecter
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Créer un compte
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {isAuthenticated ? (
                <button onClick={() => navigate('/home')} className="col-span-2 rounded-lg bg-brand-600 py-2.5 font-semibold text-white">
                  Ouvrir mon espace
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700">
                    Se connecter
                  </button>
                  <button onClick={() => navigate('/register')} className="rounded-lg bg-brand-600 py-2.5 font-semibold text-white">
                    Créer un compte
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="haut">
        {/* Accroche */}
        <section className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
          <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
          <div className="absolute -left-32 -top-24 -z-10 h-96 w-96 animate-blob rounded-full bg-brand-300/40 blur-3xl" />
          <div className="absolute -right-24 top-20 -z-10 h-96 w-96 animate-blob rounded-full bg-sky-300/40 blur-3xl" style={{ animationDelay: '-5s' }} />
          <div className="absolute bottom-0 left-1/3 -z-10 h-80 w-80 animate-blob rounded-full bg-sky-200/50 blur-3xl" style={{ animationDelay: '-10s' }} />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-12">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                30 Go offerts à l'inscription
              </div>
              <h1
                className="animate-fade-up text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl xl:text-6xl"
                style={{ animationDelay: '100ms' }}
              >
                Vos fichiers,{' '}
                <span className="animate-gradient-x whitespace-nowrap bg-gradient-to-r from-brand-600 via-sky-500 to-sky-500 bg-[length:200%_auto] bg-clip-text text-transparent">
                  en sécurité
                </span>
                {" "}et toujours à portée de main.
              </h1>
              <p
                className="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-gray-600 lg:mx-0"
                style={{ animationDelay: '200ms' }}
              >
                Stockez, organisez et prévisualisez tous vos documents, photos et vidéos dans un espace cloud
                simple et sécurisé. Retrouvez-les en un instant, depuis n'importe quel appareil.
              </p>

              <div
                className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
                style={{ animationDelay: '300ms' }}
              >
                <button
                  onClick={() => navigate(primaryAction.to)}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 sm:w-auto"
                >
                  <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative">{primaryAction.label}</span>
                  <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white/80 px-7 py-3.5 text-base font-semibold text-gray-800 backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 sm:w-auto"
                  >
                    J'ai déjà un compte
                  </button>
                )}
              </div>

              <div
                className="mt-8 flex animate-fade-up flex-col items-center gap-3 text-sm text-gray-500 sm:flex-row lg:justify-start"
                style={{ animationDelay: '400ms' }}
              >
                <span>Connexion en un clic avec</span>
                <span className="flex items-center gap-2">
                  {[
                    { Icon: GoogleIcon, label: 'Google' },
                    { Icon: GitHubIcon, label: 'GitHub', className: 'text-gray-900' },
                    { Icon: MicrosoftIcon, label: 'Microsoft' },
                  ].map(({ Icon, label, className }) => (
                    <span key={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                      <Icon className={`h-[18px] w-[18px] ${className || ''}`} />
                    </span>
                  ))}
                </span>
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '350ms' }}>
              <AppPreview />
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="border-y border-gray-100 bg-gray-50/60 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <div key={stat.label} data-reveal data-delay={index * 100} className="text-center">
                <p className="bg-gradient-to-br from-brand-600 to-sky-600 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mx-auto mt-2 max-w-[14rem] text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fonctionnalités */}
        <section id="fonctionnalites" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">Fonctionnalités</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce qu'il faut pour gérer vos fichiers</h2>
              <p className="mt-4 text-lg text-gray-600">
                Une interface claire, inspirée des meilleurs services de stockage, pour aller droit à l'essentiel.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text, color }, index) => (
                <div
                  key={title}
                  data-reveal
                  data-delay={(index % 3) * 120}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl hover:shadow-brand-500/10"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="leading-relaxed text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="fonctionnement" className="scroll-mt-20 bg-gradient-to-b from-brand-50/60 to-white px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div data-reveal className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">Comment ça marche</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Prêt en moins d'une minute</h2>
            </div>

            <div className="relative grid gap-10 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-8 hidden h-0.5 bg-gradient-to-r from-brand-200 via-sky-300 to-brand-200 md:block" />
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <div key={title} data-reveal data-delay={index * 150} className="relative text-center">
                  <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400/30" style={{ animationDelay: `${index * 0.6}s` }} />
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-600 shadow-lg ring-1 ring-brand-100">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                  <p className="mx-auto max-w-xs text-gray-600">{text}</p>
                </div>
              ))}
            </div>

            <div data-reveal className="mt-14 flex items-center justify-center gap-6 text-gray-400">
              <Laptop className="h-7 w-7" />
              <span className="h-px w-10 bg-gray-200" />
              <Smartphone className="h-6 w-6" />
              <span className="h-px w-10 bg-gray-200" />
              <Cloud className="h-7 w-7 text-brand-400" />
            </div>
          </div>
        </section>

        {/* Sécurité */}
        <section id="securite" className="relative isolate scroll-mt-20 overflow-hidden bg-brand-950 px-4 py-24 text-white sm:px-6 lg:px-8">
          <div className="absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] animate-blob rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 -z-10 h-[28rem] w-[28rem] animate-blob rounded-full bg-sky-700/25 blur-3xl" style={{ animationDelay: '-8s' }} />

          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <p data-reveal className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">Sécurité</p>
              <h2 data-reveal data-delay="80" className="text-3xl font-bold tracking-tight sm:text-4xl">
                Votre espace est protégé, à chaque étape
              </h2>
              <p data-reveal data-delay="160" className="mt-4 text-lg text-gray-400">
                SUPCloud applique les bonnes pratiques de sécurité, de la connexion jusqu'au téléchargement de vos fichiers.
              </p>
              <ul className="mt-10 space-y-4">
                {SECURITY_POINTS.map(({ icon: Icon, text }, index) => (
                  <li key={text} data-reveal data-delay={200 + index * 90} className="flex items-start gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300 ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="pt-1.5 text-gray-200">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal data-delay="200" className="relative mx-auto flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96">
              <span className="absolute h-48 w-48 animate-pulse-ring rounded-full border border-brand-400/40" />
              <span className="absolute h-48 w-48 animate-pulse-ring rounded-full border border-brand-400/40" style={{ animationDelay: '0.8s' }} />
              <span className="absolute h-48 w-48 animate-pulse-ring rounded-full border border-brand-400/40" style={{ animationDelay: '1.6s' }} />
              <div className="relative flex h-40 w-40 animate-float items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-sky-600 shadow-2xl shadow-brand-600/50">
                <ShieldCheck className="h-20 w-20 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute left-0 top-10 flex animate-float-slow items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs ring-1 ring-white/15 backdrop-blur">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Connexion vérifiée
              </div>
              <div
                className="absolute bottom-12 right-0 flex animate-float-slow items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs ring-1 ring-white/15 backdrop-blur"
                style={{ animationDelay: '2s' }}
              >
                <LockKeyhole className="h-4 w-4 text-brand-300" /> Accès réservé à vous
              </div>
            </div>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-sky-600 to-brand-700 px-6 py-16 text-center shadow-2xl shadow-brand-600/30 sm:px-16"
          >
            <div className="bg-grid absolute inset-0 -z-10 opacity-30" />
            <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 animate-blob rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Prêt à libérer de l'espace ?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Créez votre compte en quelques secondes et profitez immédiatement de vos 30 Go de stockage.
            </p>
            <button
              onClick={() => navigate(primaryAction.to)}
              className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {primaryAction.label}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src="/supcloud.png" alt="SUPCloud" className="h-9" />
            <span className="text-sm text-gray-500">Votre stockage cloud sécurisé</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500" aria-label="Liens du pied de page">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-brand-600">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-gray-400">© 2026 SUPCloud</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
