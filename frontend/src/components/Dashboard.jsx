import React from 'react';
import TermsAcceptanceGate from './TermsAcceptanceGate';

const Dashboard = ({
    stats,
    dossie,
    dossieLoading,
    dossieError,
    onGerarDossie,
    termsAccepted,
    onToggleTermsAccepted,
    onOpenTerms,
}) => {
    if (!stats) return null;

    return (
        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-gradient inline-block">Perfil do Magistrado</h2>
            <div className="space-y-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 uppercase tracking-tighter mb-1">Nome Completo</p>
                    <p className="text-lg font-semibold">{stats.nome}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 uppercase tracking-tighter mb-1">Volume de Dados</p>
                    <p className="text-lg font-semibold">{stats.total_decisoes} <span className="text-sm font-normal text-gray-400">decisões catalogadas</span></p>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-bold mb-2">🧠 Dossiê Decisório (IA Generativa)</h3>
                <p className="text-sm text-gray-300 mb-4">
                    Gere um perfil comportamental do magistrado com base nos padrões de decisões armazenados.
                </p>

                <TermsAcceptanceGate
                    accepted={termsAccepted}
                    onChange={onToggleTermsAccepted}
                    onOpenTerms={onOpenTerms}
                    helperText="Para gerar o dossiê com IA, confirme o aceite dos Termos de Uso."
                />

                <button
                    onClick={onGerarDossie}
                    disabled={!termsAccepted || dossieLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
                >
                    {dossieLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Mapeando Perfil Jurídico...
                        </span>
                    ) : 'Gerar Dossiê do Magistrado'}
                </button>

                {dossieError && (
                    <div className="mt-4 bg-red-900/40 border border-red-800 p-3 rounded">
                        <p className="text-sm text-red-200">{dossieError}</p>
                    </div>
                )}

                {dossie && (
                    <div className="mt-6 bg-black/30 p-5 rounded-xl border border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-300 text-sm uppercase tracking-widest">Dossiê Estratégico</h4>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded uppercase">IA Analítica</span>
                        </div>
                        <div className="text-gray-200 text-sm leading-relaxed prose prose-invert max-w-none">
                            {dossie.split('\n').map((line, i) => (
                                <p key={i} className={line.startsWith('#') ? 'font-bold text-lg mt-4 mb-2' : 'mb-2'}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
