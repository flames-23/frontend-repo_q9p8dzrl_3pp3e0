import React from 'react';
import { Slider } from '@radix-ui/react-slider';

function formatIDR(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function BudgetInput({ budget, setBudget, onSubmit, dark, loading }) {
  const min = 500000;
  const max = 30000000;
  const step = 100000;

  const handleSlider = (e) => {
    const v = Number(e.target.value);
    if (!Number.isNaN(v)) setBudget(Math.min(Math.max(v, min), max));
  };

  const handleInput = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    const num = Number(v || 0);
    setBudget(Math.min(Math.max(num, min), max));
  };

  return (
    <section className={`-mt-12 sm:-mt-16 relative z-20`}> 
      <div className={`max-w-3xl mx-auto rounded-2xl shadow-lg p-6 sm:p-8 ${dark ? 'bg-neutral-900 border border-white/10' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${dark ? 'text-white' : 'text-slate-700'}`}>Enter your budget (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatIDR(budget)}
              onChange={handleInput}
              placeholder="Enter your budget (Rp) — e.g. 3,000,000"
              className={`w-full rounded-xl border px-4 py-3 text-base ${dark ? 'bg-neutral-800 border-white/10 text-white placeholder-white/40' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={budget}
              onChange={handleSlider}
              className="mt-4 w-full"
            />
            <div className={`mt-2 text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>Range: {formatIDR(min)} – {formatIDR(max)}</div>
          </div>
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-sm transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'} ${dark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
          >
            {loading ? 'Calculating…' : 'Get Recommendation'}
          </button>
        </div>
      </div>
    </section>
  );
}
