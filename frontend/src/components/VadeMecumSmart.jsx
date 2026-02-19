import React, { useState } from 'react';
import { api } from '../services/api';

const VadeMecumSmart = () => {
    const [law, setLaw] = useState('CPC/15');
    const [article, setArticle] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [topicResults, setTopicResults] = useState([]);
    const [topicLoading, setTopicLoading] = useState(false);

    const handleLookup = async (e) => {
        if (e) e.preventDefault();
        if (!article) return;
        setLoading(true);
        try {
            const res = await api.get('/lifestyle/legislation/lookup', { params: { law, article } });
            setSearchResult(res.data?.data);
        } catch (err) {
            console.error("Lookup Error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTopicSearch = async (e) => {
        if (e) e.preventDefault();
        if (!topic) return;
        setTopicLoading(true);
        try {
            const res = await api.get('/lifestyle/legislation/search', { params: { topic } });
            setTopicResults(res.data?.data || []);
        } catch (err) {
            console.error("Topic Search Error", err);
        } finally {
            setTopicLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Article Lookup */}
                <div className="premium-glass p-8 rounded-3xl border border-white/5 shadow-2xl">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Consulta de Artigo
                    </h3>

                    <form onSubmit={handleLookup} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <select
                                value={law}
                                onChange={(e) => setLaw(e.target.value)}
                                className="col-span-1 bg-white/5 border border-white/10 text-white text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            >
                                <option value="CPC/15" className="bg-[#0c0f16]">CPC/15</option>
                                <option value="CC/02" className="bg-[#0c0f16]">CC/02</option>
                            </select>
                            <input
                                type="text"
                                value={article}
                                onChange={(e) => setArticle(e.target.value)}
                                placeholder="Nº Artigo"
                                className="col-span-2 bg-white/5 border border-white/10 text-white text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-premium py-3 font-bold text-xs"
                        >
                            {loading ? 'Consultando...' : 'Localizar Norma'}
                        </button>
                    </form>

                    {searchResult && (
                        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-blue-500/20 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{searchResult.law} • ART. {searchResult.article}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mb-6 italic border-l-2 border-blue-500/30 pl-4">
                                "{searchResult.content}"
                            </p>
                            <div className="bg-blue-500/10 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-blue-300 uppercase mb-2">Insight de IA:</p>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{searchResult.ai_insight}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Topic Semantic Search */}
                <div className="premium-glass p-8 rounded-3xl border border-white/5 shadow-2xl">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Busca por Tópico
                    </h3>

                    <form onSubmit={handleTopicSearch} className="space-y-4">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Responsabilidade Civil, Contestação..."
                            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={topicLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-xl text-xs font-bold shadow-lg hover:scale-[1.02] transition-all"
                        >
                            {topicLoading ? 'Buscando Contexto...' : 'Descobrir Normas Relacionadas'}
                        </button>
                    </form>

                    <div className="mt-8 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {topicResults.map((item, idx) => (
                            <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-purple-400">{item.law} • Art. {item.article}</span>
                                    <svg className="w-3 h-3 text-slate-500 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.snippet}</p>
                            </div>
                        ))}
                        {topicResults.length === 0 && !topicLoading && (
                            <div className="text-center py-10 opacity-30">
                                <p className="text-xs italic">Busque um tópico para ver as normas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="premium-glass p-6 rounded-3xl flex items-center justify-between border-emerald-500/10">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-full">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Compliance Legislativo Ativado</h4>
                        <p className="text-[10px] text-slate-500">A base do Vade Mecum é atualizada semanalmente conforme o DOU.</p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase underline tracking-tighter">Ver Histórico de Súmulas</button>
            </div>
        </div>
    );
};

export default VadeMecumSmart;
