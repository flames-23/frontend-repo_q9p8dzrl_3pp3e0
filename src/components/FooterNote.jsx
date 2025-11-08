import React from 'react';

export default function FooterNote({ dark }) {
  return (
    <footer className="mt-16 mb-10">
      <p className={`text-center text-sm ${dark ? 'text-white/60' : 'text-slate-500'}`}>
        Prices are for demonstration purposes only.
      </p>
    </footer>
  );
}
