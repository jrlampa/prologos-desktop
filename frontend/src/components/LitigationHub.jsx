import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIAnalystPanel from './AIAnalystPanel';

const LitigationHub = () => {
    const [watchers, setWatchers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        api.get('/litigation/watchers').then(res => setWatchers(res.data.watchers));
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;
        setLoading(true);
        try {
            const res = await api.post(`/litigation/query-publications?query=${encodeURIComponent(searchQuery)}`);
            setResults(res.data);
        } finally {
            setLoading(false);
        }
    };

    const runAIAnalysis = async (hit) => {
        setIsAnalyzing(true);
        setSelectedRecord(hit); // Set initial record to display while analyzing
        setIsPanelOpen(true);
        try {
            const res = await api.post(`/legal-ai/analyze?raw_text=${encodeURIComponent(hit.content)}&tribunal=${hit.tribunal}&process_number=${encodeURIComponent(hit.process_number)}`);
            setSelectedRecord(res.data); // Update with analyzed record
        } catch (error) {
            console.error("AI Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* AI Analyst Side-Drawer */}
            <AIAnalystPanel
                record={selectedRecord}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                isLoading={isAnalyzing}
            />

            {/* Header & Stats Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-blue-500/20 blur-3xl opacity-50"></div>
                <div className="relative bg-slate-950/80 backdrop-blur-3xl rounded-[23px] p-8 md:p-12 border border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-widest uppercase border border-indigo-500/20 rounded-full">Inteligência Estratégica</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Monitoramento em Tempo Real</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                Hub de Litigância <span className="text-gradient">Soberana</span>
                            </h2>
                            <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">
                                Monitoramento industrial de Diários Oficiais e Diários de Justiça.
                                Nossas sentinelas varrem o ecossistema jurídico brasileiro 24/7 para transformar dados brutos em inteligência estruturada.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center min-w-[140px]">
                                <div className="text-3xl font-black text-white mb-1">92</div>
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Tribunais</div>
                            </div>
                            <div className="bg-indigo-600 p-6 rounded-2xl text-center min-w-[140px] shadow-lg shadow-indigo-600/20 text-white">
                                <div className="text-3xl font-black mb-1">AI</div>
                                <div className="text-[9px] font-black uppercase tracking-widest">ENABLED</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Watchers & Sentinelas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            Sentinelas Ativas
                        </h3>
                        <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">+ Nova Sentinela</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {watchers.map(w => (
                            <div key={w.id} className="premium-glass p-6 group hover:translate-y-[-4px] transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">
                                        {w.keyword[0]}
                                    </div>
                                    <span className={`h-2.5 w-2.5 rounded-full ${w.last_hit ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-slate-200'}`}></span>
                                </div>
                                <h4 className="text-base font-black text-slate-800 mb-1">{w.keyword}</h4>
                                <div className="flex gap-2 mb-4">
                                    {w.tags.map(t => (
                                        <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase border border-slate-200">{t}</span>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Última captura</span>
                                    <span className="text-[10px] text-slate-700 font-black">{w.last_hit || 'S/ Ocorrências'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800">Sovereign Insights</h3>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="text-[10px] font-black text-indigo-600 uppercase mb-1">IA Status</div>
                            <div className="text-sm font-bold text-slate-800">Modelos Llama 3 ativos e otimizados.</div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="text-[10px] font-black text-emerald-600 uppercase mb-1">Normalização</div>
                            <div className="text-sm font-bold text-slate-800">Universal Schema v1.0 ativo para 92 tribunais.</div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-indigo-400">Governance Note</h4>
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                            O hub do Prólogos utiliza processamento de linguagem natural para filtrar ruídos em Diários Oficiais, garantindo que apenas publicações relevantes cheguem ao seu radar.
                        </p>
                    </div>
                </div>
            </div>

            {/* Publication Search Box */}
            <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-indigo-500/5 border border-slate-100">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-black text-slate-800 mb-2 italic-text">Consultoria Jurídica Global</h3>
                        <p className="text-slate-400 text-sm">Pesquise em todo o acervo nacional de publicações oficiais simultaneamente.</p>
                    </div>

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nome, OAB ou Termos Estratégicos (e.g. Silva)..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-40 py-5 text-slate-800 font-bold placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                        />
                        <div className="absolute inset-y-2 right-2 flex items-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-full px-8 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl font-black uppercase tracking-tighter transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                            >
                                {loading && <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                {loading ? 'Sincronizando...' : 'Consultar'}
                            </button>
                        </div>
                    </form>
                </div>

                {results && (
                    <div className="mt-12 space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between px-4">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                {results.hits.length} ocorrência(s) em {results.latency_ms}ms
                            </p>
                            <div className="h-px flex-grow mx-6 bg-slate-100"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {results.hits.map((hit, idx) => (
                                <div key={idx} className="group p-8 bg-slate-50 rounded-[28px] border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 shadow-sm uppercase">
                                                {hit.tribunal}
                                            </div>
                                            <div className="text-xs text-slate-500 font-bold border-l border-slate-200 pl-4">
                                                {new Date(hit.publication_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {hit.process_number}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risco AI</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`h-1 w-4 rounded-full ${i < (hit.ai_risk_score * 5) ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => runAIAnalysis(hit)}
                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
                                            >
                                                Análise Soberana
                                            </button>
                                        </div>
                                    </div>

                                    <h5 className="text-lg font-black text-slate-800 mb-4">{hit.raw_source}</h5>

                                    <div className="relative group/content">
                                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-mono bg-white p-6 rounded-2xl border border-slate-100 group-hover:bg-slate-50 transition-colors italic-text line-clamp-3">
                                            {hit.content}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {hit.entities.map((e, i) => (
                                            <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded-md uppercase">
                                                {e.role}: {e.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LitigationHub;
