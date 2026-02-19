import React, { useState } from 'react';
import { api } from '../services/api';

const LegalDraftingAssistant = () => {
    const [thesis, setThesis] = useState('Dano Moral');
    const [context, setContext] = useState('');
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/lifestyle/drafting/generate', null, {
                params: { thesis, context }
            });
            setDraft(res.data?.data);
        } catch (err) {
            console.error("Drafting Error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="premium-glass p-8 rounded-3xl border border-white/5 shadow-2xl h-full">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Parâmetros da Tese
                        </h3>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tipo de Tese Defensiva</label>
                                <select
                                    value={thesis}
                                    onChange={(e) => setThesis(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                                >
                                    <option value="Dano Moral" className="bg-[#0c0f16]">Impugnação de Dano Moral</option>
                                    <option value="Contestação" className="bg-[#0c0f16]">Contestação Genérica (CPC)</option>
                                    <option value="Ato Ilícito" className="bg-[#0c0f16]">Ausência de Nexo Causal</option>
                                    <option value="Inépcia" className="bg-[#0c0f16]">Preliminar de Inépcia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contexto Específico (Opcional)</label>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="Descreva detalhes do caso para personalizar o rascunho..."
                                    rows="4"
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all custom-scrollbar"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-4 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                )}
                                {loading ? 'Sintetizando Redação...' : 'Gerar Rascunho da Tese'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-3 space-y-6">
                    {!draft && !loading && (
                        <div className="h-full flex flex-col items-center justify-center premium-glass rounded-3xl border-dashed border-white/5 opacity-50 text-center p-12">
                            <svg className="w-16 h-16 text-slate-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-sm italic text-slate-400">Configure os parâmetros ao lado para gerar uma redação jurídica assistida por IA.</p>
                        </div>
                    )}

                    {draft && (
                        <div className="premium-glass p-8 rounded-3xl border border-white/10 animate-fade-in space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-slate-200">Rascunho Sugerido: {draft.title}</h4>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(draft.snippet)}
                                        className="text-[10px] font-bold text-emerald-400 hover:text-white transition-all underline"
                                    >
                                        COPIAR TEXTO
                                    </button>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <p className="text-sm text-slate-300 leading-relaxed font-serif">
                                        {draft.snippet}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Precedente de Origem</h5>
                                    <p className="text-[11px] text-slate-400 line-clamp-3 mb-2 italic">"{draft.source_precedent.ementa}"</p>
                                    <span className="text-[9px] font-bold text-blue-400 uppercase">{draft.source_precedent.tribunal}</span>
                                </div>

                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                                    <h5 className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest mb-3">Ações Recomendadas</h5>
                                    <ul className="space-y-2">
                                        {draft.recommended_actions.map((act, i) => (
                                            <li key={i} className="flex gap-2 items-center">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                                <span className="text-[10px] text-slate-300 font-medium">{act}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <p className="text-[10px] text-amber-500 font-bold leading-relaxed">
                                    <span className="mr-2 italic">AVISO:</span>
                                    Este conteúdo é uma sugestão computacional. Cabe ao advogado a revisão técnica e adaptação ao caso concreto.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalDraftingAssistant;
