import React from 'react';
import Spline from '@splinetool/react-spline';
import { Moon, Sun } from 'lucide-react';

export default function HeaderHero({ dark, onToggleDark }) {
  return (
    <header className={`relative overflow-hidden ${dark ? 'bg-neutral-950' : 'bg-slate-50'} transition-colors`}> 
      <div className="absolute inset-0 opacity-70">
        <Spline scene="https://prod.spline.design/fcD-iW8YZHyBp1qq/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-20 sm:pt-12 sm:pb-28">
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Build Your PC by Budget</h1>

          <button
            aria-label="Toggle dark mode"
            onClick={onToggleDark}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-white shadow-sm hover:bg-white/20 transition"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-sm">{dark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <p className={`mt-4 max-w-2xl ${dark ? 'text-white/80' : 'text-slate-700'} text-base sm:text-lg`}>
          Enter your budget in Indonesian Rupiah and we’ll recommend a balanced set of PC components that fits.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/80 backdrop-blur shadow-sm p-4 pointer-events-auto">
            <p className="text-sm text-slate-600">Technology</p>
            <p className="font-semibold">Gaming • Digital • Modern</p>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur shadow-sm p-4 pointer-events-auto">
            <p className="text-sm text-slate-600">Responsive</p>
            <p className="font-semibold">Mobile-first design</p>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur shadow-sm p-4 pointer-events-auto">
            <p className="text-sm text-slate-600">Local Pricing</p>
            <p className="font-semibold">Formatted in Rupiah</p>
          </div>
        </div>
      </div>
    </header>
  );
}
