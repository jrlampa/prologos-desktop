import React from 'react';

export default function LegalDisclaimer({ accepted, onToggleAccepted, onOpenTerms }) {
  return (
    <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 glass shadow-inner">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-blue-500/20 p-2 rounded-lg">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm text-gray-200">
              <span className="font-bold text-blue-400">AVISO LEGAL:</span> Esta ferramenta fornece{' '}
              <span className="font-semibold underline decoration-blue-500/30">análises estatísticas e probabilísticas</span>.{' '}
              Não substitui o aconselhamento jurídico profissional nem garante resultados processuais.
            </p>
            <button
              type="button"
              onClick={onOpenTerms}
              className="mt-1 text-xs font-semibold text-blue-400/80 hover:text-blue-300 transition-colors uppercase tracking-widest"
            >
              Termos de Uso e Privacidade (LGPD)
            </button>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 p-3 rounded-xl transition-all duration-300 border border-white/5">
          <input
            type="checkbox"
            checked={!!accepted}
            onChange={(e) => onToggleAccepted?.(e.target.checked)}
            className="h-5 w-5 accent-blue-500 rounded-lg border-none"
          />
          <span className="font-medium">
            Entendo e aceito os termos
          </span>
        </label>
      </div>
    </div>
  );
}

