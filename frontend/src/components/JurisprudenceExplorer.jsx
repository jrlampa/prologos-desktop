import React, { useState } from 'react';
import { api } from '../services/api';

const JurisprudenceExplorer = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query) return;
        setLoading(true);
        try {
            const res = await api.get('/jurisprudence/search', { params: { query } });
            setResults(res.data?.data || []);
        } catch (e) {
            console.error("Search Failure", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        setReportLoading(true);
        try {
            const res = await api.post('/jurisprudence/generate-report');
            setReport(res.data?.data);
        } catch (e) {
            console.error("Report Generation Failure", e);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in">
            {/* 1. Neural Search Bar */}
            <div className="relative">
                <form onSubmit={handleSearch} className="premium-glass p-2 rounded-2xl flex items-center shadow-2xl">
                    <div className="pl-4 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquise por teses de defesa, artigos ou tribunais (Busca Neural)..."
                        className="bg-transparent border-none text-white text-lg rounded-xl focus:ring-0 block w-full p-4 font-medium outline-none"
                    />
                    <button
                        type="submit"
                        className="btn-premium px-8 py-3 !rounded-xl"
                    >
                        {loading ? 'Consultando Vetores...' : 'Buscar Precedentes'}
                    </button>
                </form>
                <div className="absolute -bottom-6 left-6 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Prioridade STF Ativa</span>
                    <span>•</span>
                    <span>Similaridade Semântica: 0.95+</span>
                </div>
            </div>

            {/* 2. Results & Report Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Results Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        Precedentes Relevantes Encontrados
                    </h3>

                    {results.length === 0 && !loading && (
                        <div className="text-center py-20 premium-glass rounded-3xl border-dashed border-white/5">
                            <p className="text-slate-500 text-sm italic">Inicie uma busca para explorar a base de jurisprudência neural.</p>
                        </div>
                    )}

                    {results.map((item) => (
                        <div key={item.id} className="premium-glass p-6 rounded-2xl border-l-4 border-l-blue-500 hover:bg-white/5 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${item.tribunal === 'STF' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {item.tribunal} • {item.relator}
                                </span>
                                <span className="text-xs text-slate-500 font-bold">{item.data}</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed mb-4">{item.ementa}</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1 flex-grow bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${item.similaridade * 100}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">{(item.similaridade * 100).toFixed(0)}% Similar</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Executive Report Gen */}
                <div className="space-y-6">
                    <div className="premium-glass p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Relatório Estratégico</h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Combine os precedentes encontrados em um relatório executivo de alta fidelidade para apresentação formal.
                        </p>
                        <button
                            onClick={handleGenerateReport}
                            disabled={reportLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {reportLoading ? (
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            )}
                            {reportLoading ? 'Formatando Inteligência...' : 'Gerar Sumário Executivo'}
                        </button>
                    </div>

                    {report && (
                        <div className="premium-glass p-6 rounded-3xl animate-fade-in border-emerald-500/30">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">{report.confidentiality}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-200 mb-3">{report.title}</h4>
                            <p className="text-[11px] text-slate-400 italic mb-6 leading-relaxed">"{report.summary}"</p>

                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Recomendações:</p>
                                {report.recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                        <p className="text-[10px] text-slate-300 font-medium">{rec}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-8 border border-white/5 py-2 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-white/5 transition-all">
                                IMPRIMIR DOSSIÊ FORMAL
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JurisprudenceExplorer;
