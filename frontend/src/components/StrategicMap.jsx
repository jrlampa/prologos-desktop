import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const StrategicMap = () => {
    const [subject, setSubject] = useState('Dano Moral');
    const [comparisonData, setComparisonData] = useState(null);
    const [draftText, setDraftText] = useState('');
    const [selectedComarca, setSelectedComarca] = useState('Niterói');
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        loadComparison();
    }, [subject]);

    const loadComparison = () => {
        api.get(`/jurisdiction/compare?subject=${subject}`)
            .then(res => setComparisonData(res.data?.data));
    };

    const handlePredict = () => {
        if (!draftText) return;
        api.post('/jurisdiction/predict', {
            draft_text: draftText,
            comarca: selectedComarca
        }).then(res => setPrediction(res.data?.data));
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto mt-10 border-t border-slate-200 pt-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Radar Estratégico</h2>
                    <p className="text-slate-500 font-medium">Comparativo de Jurisdição & Previsão de Êxito</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Comparativo de Comarcas */}
                <div className="premium-glass p-8 rounded-2xl space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" /></svg>
                            Mapa de Calor: {subject}
                        </h3>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none"
                        >
                            <option value="Dano Moral">Dano Moral</option>
                            <option value="Consumidor">Consumidor</option>
                            <option value="Trabalhista">Trabalhista</option>
                        </select>
                    </div>

                    {comparisonData && (
                        <div className="space-y-4">
                            {Object.entries(comparisonData.comarcas).map(([name, stats]) => (
                                <div key={name} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white ${stats.success_rate >= 0.6 ? 'bg-emerald-500' :
                                            stats.success_rate >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}>
                                        {Math.round(stats.success_rate * 100)}%
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-slate-800">{name}</h4>
                                        <p className="text-xs text-slate-500">Duração média: {stats.avg_duration_days} dias</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-mono font-bold text-slate-700">
                                            {stats.avg_moral_damages.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">{stats.tendency}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium text-center">
                                💡 Recomendação da IA: <strong>{comparisonData.recommendation}</strong> apresenta o melhor custo-benefício.
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Simulador de Petição (Pre-Filing) */}
                <div className="premium-glass p-8 rounded-2xl space-y-6">
                    <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Simulador de Distribuição
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comarca Alvo</label>
                            <select
                                value={selectedComarca}
                                onChange={(e) => setSelectedComarca(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none"
                            >
                                <option value="Niterói">Niterói (TJ-RJ)</option>
                                <option value="Sapucaia">Sapucaia (TJ-RJ)</option>
                                <option value="Capital">Capital (TJ-RJ)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumo da Petição / Tese</label>
                            <textarea
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                                placeholder="Descreva os fatos ou cole um trecho da inicial..."
                                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            />
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={!draftText}
                            className="w-full btn-premium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
                        >
                            Avaliar Risco na Comarca
                        </button>

                        {prediction && (
                            <div className="animate-fade-in bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-indigo-500 uppercase">Probabilidade de Êxito</span>
                                    <span className="text-lg font-black text-indigo-700">{Math.round(prediction.predicted_success_probability * 100)}%</span>
                                </div>
                                <div className="h-2 bg-indigo-200 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-1000"
                                        style={{ width: `${prediction.predicted_success_probability * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-indigo-600 font-medium">
                                    {prediction.analysis}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategicMap;
