import React, { useState } from 'react';
import { api } from '../services/api';

const CaseIntelligence = () => {
    const [cnjInput, setCnjInput] = useState('');
    const [clonedCase, setClonedCase] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState('timeline'); // timeline, prediction

    const handleClone = () => {
        if (!cnjInput) return;
        setLoading(true);
        api.post(`/crawler/clone/${cnjInput}`)
            .then(res => setClonedCase(res.data?.data))
            .finally(() => setLoading(false));
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Inteligência Processual</h2>
                    <p className="text-slate-500 font-medium">Clonagem de Dados & Análise Profunda</p>
                </div>
            </div>

            {/* Input Section */}
            <div className="premium-glass p-8 rounded-2xl flex gap-4 items-end">
                <div className="flex-grow">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Número CNJ</label>
                    <input
                        type="text"
                        value={cnjInput}
                        onChange={(e) => setCnjInput(e.target.value)}
                        placeholder="0001234-56.2025.8.19.0001"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <button
                    onClick={handleClone}
                    disabled={loading}
                    className="btn-premium h-[50px] px-8 flex items-center gap-2"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                            Clonar Processo
                        </>
                    )}
                </button>
            </div>

            {clonedCase && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="premium-glass p-6 rounded-2xl">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                Dados do Processo
                                {clonedCase.official_badge === 'VERIFIED_OFFICIAL' && (
                                    <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Oficial (CNJ)
                                    </span>
                                )}
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-400 block">Comarca / Vara</span>
                                    <span className="font-bold text-slate-700">{clonedCase.court} - {clonedCase.comarca}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-400 block">Assunto</span>
                                    <span className="font-bold text-slate-700">{clonedCase.subject}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-400 block">Valor da Causa</span>
                                    <span className="font-mono font-bold text-emerald-600">
                                        {clonedCase.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                                <div className="space-y-1 border-t border-slate-100 pt-4">
                                    <span className="text-xs text-slate-400 block mb-2">Partes</span>
                                    {clonedCase.parties.map((p, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm group">
                                            <span className="text-slate-500 font-medium">{p.role}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-800 font-bold truncate max-w-[150px]">{p.name}</span>
                                                <button
                                                    title="Consultar no Gov.br"
                                                    className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity"
                                                    onClick={() => {
                                                        // This would ideally open the Gov.br tab and search
                                                        // For now, let's just alert or log
                                                        console.log("Searching party:", p.name);
                                                        window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'gov-br', query: p.name } }));
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="premium-glass p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">IA Predict</h3>
                            <div className="text-2xl font-black text-indigo-700 mb-1">
                                {clonedCase.prediction === 'PROBABLE_SUCCESS' ? 'Tendência Favorável' : 'Incerto'}
                            </div>
                            <p className="text-xs text-indigo-500 leading-relaxed">
                                Análise baseada em {clonedCase.movements.length} movimentos e no perfil desta vara.
                            </p>
                        </div>
                    </div>

                    {/* Timeline View */}
                    <div className="lg:col-span-2">
                        <div className="premium-glass p-8 rounded-2xl min-h-[500px]">
                            <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Linha do Tempo Processual
                            </h3>

                            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-8 py-2">
                                {clonedCase.movements.map((mov, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-2 border-white shadow-sm transition-colors ${mov.type === 'DECISION_FAV' ? 'bg-emerald-500' :
                                            mov.type === 'HEARING' ? 'bg-amber-500' :
                                                'bg-slate-300 group-hover:bg-blue-400'
                                            }`}></div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 p-4 rounded-xl hover:shadow-md transition-shadow">
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 mb-1 block">{new Date(mov.date).toLocaleDateString('pt-BR')}</span>
                                                <span className="font-bold text-slate-700 block">{mov.description}</span>
                                            </div>

                                            {mov.type === 'DECISION_FAV' && (
                                                <span className="mt-2 sm:mt-0 px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Decisão Importante</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseIntelligence;
