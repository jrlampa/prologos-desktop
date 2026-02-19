import React, { useState } from 'react';
import { api } from '../services/api';

const LegalDeadlineCalculator = () => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [days, setDays] = useState(15);
    const [isWorkingDays, setIsWorkingDays] = useState(true);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guide, setGuide] = useState(null);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const res = await api.get('/legal/calculate-deadline', {
                params: { start_date: startDate, days, is_working_days: isWorkingDays }
            });
            setResult(res.data?.data);

            // Auto-fetch guide if typical deadline (ex: 15 days)
            if (days === 15) {
                const guideRes = await api.get('/legal/procedural-guide/contestacao');
                setGuide(guideRes.data?.data);
            } else {
                setGuide(null);
            }
        } catch (e) {
            console.error("Deadline Calculation Error", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="premium-glass p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Calculadora de Prazos (CPC/2015)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data da Intimação / Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quantidade de Dias</label>
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                    <button
                        onClick={() => setIsWorkingDays(!isWorkingDays)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isWorkingDays ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                        {isWorkingDays ? '✓ Dias Úteis (CPC)' : 'Dias Corridos'}
                    </button>
                    <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="btn-premium !bg-emerald-600 !hover:bg-emerald-500 flex-grow"
                    >
                        {loading ? 'Processando Calendário Forense...' : 'Calcular Prazo Fatal'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="premium-glass p-6 rounded-2xl border-l-4 border-l-emerald-500">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Prazo Fatal Estimado</p>
                        <h4 className="text-3xl font-black text-emerald-400">
                            {new Date(result.deadline_date).toLocaleDateString('pt-BR')}
                        </h4>
                        <p className="mt-2 text-xs text-slate-400 font-medium italic">
                            {result.legal_basis} — Considere suspensões locais.
                        </p>
                    </div>

                    {guide && (
                        <div className="premium-glass p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                            <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                Dica Estratégica
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "{guide.dica_pro}"
                            </p>
                            <p className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                                Fundamentação: {guide.base_legal}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LegalDeadlineCalculator;
