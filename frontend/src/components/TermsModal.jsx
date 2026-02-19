import React from 'react';

const DEFAULT_TITLE = 'Termos de Uso e Aviso Legal';

export default function TermsModal({ isOpen, onClose, title = DEFAULT_TITLE }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl glass-card rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-2.5 rounded-xl">
              <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Versão v1.0 • Jan 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-8 text-gray-300 custom-scrollbar scroll-smooth">
          <div className="space-y-8">
            <p className="text-lg leading-relaxed text-gray-200 font-medium border-l-4 border-blue-500/50 pl-6 py-1">
              Este produto fornece análises automatizadas e conteúdos gerados por IA.
              Ao utilizar o sistema, você concorda com os parâmetros de responsabilidade técnica abaixo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="mb-3 text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Natureza Informativa
                </h3>
                <p className="text-sm leading-relaxed opacity-80">
                  As respostas podem conter imprecisões ou desatualizações. O conteúdo não constitui aconselhamento jurídico ou garantia de resultado.
                </p>
              </section>

              <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="mb-3 text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Supervisão Humana
                </h3>
                <p className="text-sm leading-relaxed opacity-80">
                  Decisões jurídicas devem ser validadas por profissional habilitado. Use a IA como rascunho e ponto de partida analítico.
                </p>
              </section>
            </div>

            <section className="space-y-4">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-2">Uso Responsável e LGPD</h3>
              <div className="grid gap-3">
                {[
                  "Responsabilidade integral pela revisão final das peças geradas.",
                  "Proibição de uso para fins ilícitos ou discriminatórios.",
                  "Sigilo Profissional: Evite dados sensíveis em documentos não-anônimos.",
                  "Tratamento de dados em conformidade com a LGPD brasileira."
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0" />
                    <p className="text-sm opacity-80">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="bg-white/5 border-t border-white/10 p-6 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center gap-2 italic">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Para maior segurança, revise sempre as saídas da IA antes de utilizar em petições.
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

