import React from 'react';
import { CheckCircle2, AlertTriangle, Rocket } from 'lucide-react';

function formatIDR(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function ResultCard({ result, dark }) {
  if (!result) return null;

  if (result.tooLow) {
    return (
      <div className={`max-w-3xl mx-auto mt-8 rounded-2xl p-8 text-center ${dark ? 'bg-neutral-900 border border-white/10 text-white' : 'bg-white shadow-lg'}`}>
        <div className="text-5xl mb-4">🪙</div>
        <h3 className="text-xl font-semibold mb-2">It's better to save up first.</h3>
        <p className={`${dark ? 'text-white/70' : 'text-slate-600'}`}>Try increasing your budget to meet the minimum viable build requirements.</p>
      </div>
    );
  }

  const { build, totalPrice, budget, performance, status, remaining } = result;

  return (
    <div className={`max-w-5xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6`}>
      <div className={`lg:col-span-2 rounded-2xl ${dark ? 'bg-neutral-900 border border-white/10' : 'bg-white shadow-lg'} p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>Recommended Build</h3>
        <ul className="space-y-3">
          {build.map((item) => (
            <li key={item.category} className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>{item.category}</p>
                <p className={`${dark ? 'text-white/70' : 'text-slate-600'} text-sm`}>{item.name}</p>
              </div>
              <div className={`font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{formatIDR(item.price)}</div>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t pt-4 flex items-center justify-between">
          <div>
            <p className={`text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>Total Cost</p>
            <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{formatIDR(totalPrice)}</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${status === 'within' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {status === 'within' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {status === 'within' ? 'Within Budget' : 'Over Budget'}
          </div>
        </div>
        <div className="mt-2 text-sm">
          {status === 'within' ? (
            <span className={`${dark ? 'text-white/70' : 'text-slate-600'}`}>Remaining: {formatIDR(remaining)}</span>
          ) : (
            <span className="text-rose-600">Over by: {formatIDR(Math.abs(remaining))}</span>
          )}
        </div>
      </div>

      <div className={`rounded-2xl ${dark ? 'bg-neutral-900 border border-white/10' : 'bg-white shadow-lg'} p-6`}> 
        <h4 className={`text-lg font-semibold flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
          <Rocket size={18} /> Estimated Performance
        </h4>
        <div className="mt-4">
          <div className="h-3 bg-slate-200/60 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, performance)}%` }} />
          </div>
          <p className={`mt-2 text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>Score: {performance}</p>
        </div>
        {result.tips?.length ? (
          <div className="mt-6">
            <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>Upgrade Tips</p>
            <ul className={`mt-2 list-disc pl-5 space-y-1 ${dark ? 'text-white/80' : 'text-slate-700'}`}>
              {result.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
