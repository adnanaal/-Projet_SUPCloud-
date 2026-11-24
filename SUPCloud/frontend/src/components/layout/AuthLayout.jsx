import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArchiveRestore, CheckCircle2, Eye, ShieldCheck, UploadCloud } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: UploadCloud, text: '30 Go pour stocker tous vos fichiers' },
  { icon: Eye, text: 'Aperçu des images, vidéos, PDF et textes' },
  { icon: ArchiveRestore, text: 'Corbeille : 30 jours pour changer d\'avis' },
  { icon: ShieldCheck, text: 'Connexion sécurisée, fichiers privés' },
];

/**
 * Mise en page des pages de connexion et d'inscription :
 * panneau aux couleurs du logo (grand écran) et formulaire dans une carte animée
 */
const AuthLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();

  return (
    <div className="relative isolate flex min-h-screen bg-slate-50">
      {/* Panneau de marque */}
      <aside className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="absolute -left-24 -top-24 h-96 w-96 animate-blob rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] animate-blob rounded-full bg-sky-400/30 blur-3xl" style={{ animationDelay: '-7s' }} aria-hidden="true" />

        <button
          onClick={() => navigate('/')}
          className="relative w-fit rounded-2xl bg-white px-4 py-2 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5"
          aria-label="Retour à la page d'accueil"
        >
          <img src="/supcloud.png" alt="SUPCloud" className="h-10" />
        </button>

        <div className="relative">
          <h2 className="animate-fade-up text-4xl font-extrabold leading-tight tracking-tight">
            Vos fichiers,
            <br />
            <span className="text-brand-200">toujours avec vous.</span>
          </h2>
          <p className="mt-4 max-w-md animate-fade-up text-lg text-brand-100/90" style={{ animationDelay: '100ms' }}>
            Stockez, organisez et retrouvez vos documents en toute simplicité.
          </p>
          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }, index) => (
              <li key={text} className="flex animate-fade-up items-center gap-3" style={{ animationDelay: `${200 + index * 100}ms` }}>
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <Icon className="h-5 w-5 text-brand-200" />
                </span>
                <span className="text-brand-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex w-fit animate-float items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <span className="text-sm">
            <span className="block font-semibold">Rapport annuel.pdf</span>
            <span className="text-brand-100/80">importé avec succès</span>
          </span>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        <div className="absolute -right-32 -top-32 -z-10 h-80 w-80 animate-blob rounded-full bg-brand-200/50 blur-3xl lg:hidden" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 -z-10 h-80 w-80 animate-blob rounded-full bg-sky-200/50 blur-3xl" style={{ animationDelay: '-6s' }} aria-hidden="true" />

        <div className="w-full max-w-md animate-scale-in rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-brand-900/5 backdrop-blur sm:p-10">
          <div className="mb-8 text-center">
            <button onClick={() => navigate('/')} className="mx-auto mb-6 block lg:hidden" aria-label="Retour à la page d'accueil">
              <img src="/supcloud.png" alt="SUPCloud" className="mx-auto h-16" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
