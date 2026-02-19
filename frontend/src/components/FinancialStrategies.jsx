import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FinancialStrategies = () => {
    const [indices, setIndices] = useState({});
    const [selectedState, setSelectedState] = useState('SP');
    const [oabTable, setOabTable] = useState(null);
    const [correctionValue, setCorrectionValue] = useState(10000);
    const [correctionIndex, setCorrectionIndex] = useState('IGP-M');
    const [correctionResult, setCorrectionResult] = useState(null);
    const [honorariumValue, setHonorariumValue] = useState(50000);
    const [honorariumPercent, setHonorariumPercent] = useState(20);
    const [honorariumResult, setHonorariumResult] = useState(null);

    useEffect(() => {
        api.get('/finance/indices').then(res => setIndices(res.data?.data || {}));
        fetchOABTable('SP');
    }, []);

    const fetchOABTable = (state) => {
        setSelectedState(state);
        api.get(`/finance/oab-table/${state}`)
            .then(res => setOabTable(res.data?.data))
            .catch(() => setOabTable(null));
    };

    const handleCalcCorrection = () => {
        api.post('/finance/calculate/correction', {
            value: Number(correctionValue),
            index: correctionIndex,
            start_date: '2025-01-01' // Simulado
        }).then(res => setCorrectionResult(res.data?.data));
    };

    const handleCalcHonorariums = () => {
        api.post('/finance/calculate/honorariums', {
            value: Number(honorariumValue),
            percentage: Number(honorariumPercent)
        }).then(res => setHonorariumResult(res.data?.data));
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Soberania Financeira</h2>
                    <p className="text-slate-500 font-medium">Gestão de Honorários & Inteligência de Lucro</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Calculadora de Atualização Monetária */}
                <div className="premium-glass p-8 rounded-2xl space-y-6">
                    <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Motor de Atualização Monetária
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor da Causa (R$)</label>
                            <input
                                type="number"
                                value={correctionValue}
                                onChange={(e) => setCorrectionValue(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Índice Econômico</label>
                            <select
                                value={correctionIndex}
                                onChange={(e) => setCorrectionIndex(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                {Object.keys(indices).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleCalcCorrection}
                        className="w-full btn-premium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                    >
                        Calcular Atualização
                    </button>

                    {correctionResult && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl animate-fade-in">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-emerald-600 font-bold uppercase">Valor Corrigido</span>
                                <span className="text-2xl font-black text-emerald-700">
                                    {correctionResult.corrected_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                            <div className="text-right text-xs text-emerald-500 font-mono">
                                + {correctionResult.difference.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({correctionResult.months} meses)
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Simulador de Honorários */}
                <div className="premium-glass p-8 rounded-2xl space-y-6">
                    <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 36v-3m-6 6h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Inteligência de Lucro (Sucumbência)
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Base de Cálculo (R$)</label>
                            <input
                                type="number"
                                value={honorariumValue}
                                onChange={(e) => setHonorariumValue(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">% Honorários</label>
                            <input
                                type="number"
                                value={honorariumPercent}
                                onChange={(e) => setHonorariumPercent(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCalcHonorariums}
                        className="w-full btn-premium"
                    >
                        Projetar Receita
                    </button>

                    {honorariumResult && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                <span className="block text-[10px] text-indigo-400 font-bold uppercase mb-1">Honorários Previstos</span>
                                <span className="block text-lg font-black text-indigo-700">
                                    {honorariumResult.honorarium_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Líquido Cliente</span>
                                <span className="block text-lg font-black text-slate-600">
                                    {honorariumResult.net_client_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Tabela OAB - Enterprise Explorer */}
                <div className="lg:col-span-2 premium-glass p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Tabela de Honorários Mínimos OAB ({oabTable?.year || '...'})
                        </h3>
                        <div className="flex gap-2">
                            {['SP', 'RJ'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => fetchOABTable(st)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedState === st ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    OAB/{st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {oabTable ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-400 border-b border-slate-200">
                                        <th className="p-4 uppercase tracking-wider">Categoria</th>
                                        <th className="p-4 uppercase tracking-wider">Atividade</th>
                                        <th className="p-4 uppercase tracking-wider text-right">Valor Mínimo</th>
                                        <th className="p-4 uppercase tracking-wider">Unidade</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-medium text-slate-600">
                                    {oabTable.items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-slate-400">{item.category}</td>
                                            <td className="p-4 font-bold text-slate-700">{item.activity}</td>
                                            <td className="p-4 text-right font-mono text-amber-600 font-bold">
                                                {item.min_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                {item.unit === '%' ? '%' : ''}
                                            </td>
                                            <td className="p-4 text-xs text-slate-400 uppercase">{item.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            Selecione um estado para visualizar a tabela oficial.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialStrategies;
