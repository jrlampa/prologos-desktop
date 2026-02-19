import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ExecutiveDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/executive')
            .then(res => setMetrics(res.data.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!metrics) return null;

    const { executive_summary, risk_alerts, growth_opportunities } = metrics;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover-card">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Valor da Carteira</p>
                    <p className="text-2xl font-black text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(executive_summary.portfolio_value)}
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-500 font-bold">+5.2% em relação ao mês anterior</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover-card">
                    <p className="text-xs font-bold text-red-400 uppercase mb-2">Valor em Risco (VaR)</p>
                    <p className="text-2xl font-black text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(executive_summary.value_at_risk)}
                    </p>
                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(executive_summary.value_at_risk / executive_summary.portfolio_value) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover-card">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-2">Economia Gerada (IA)</p>
                    <p className="text-2xl font-black text-blue-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(executive_summary.ai_roi_ytd)}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400 font-bold">Baseado em +455h de redação automatizada</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg border border-blue-500 text-white hover-card">
                    <p className="text-xs font-bold text-blue-100 uppercase mb-2">Health Score</p>
                    <div className="flex items-center gap-4">
                        <p className="text-4xl font-black">{executive_summary.health_score}</p>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Enterprise</div>
                            <div className="text-[10px] font-bold text-blue-200">Soberania Nível 4</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Alerts */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Alertas de Risco Estratégico
                    </h3>
                    <div className="space-y-4">
                        {risk_alerts.map((alert, idx) => (
                            <div key={idx} className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse"></div>
                                <p className="text-sm font-bold text-amber-800 leading-snug">{alert}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Opportunities */}
                <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                    </div>

                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 relative z-10">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Oportunidades de Crescimento
                    </h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Jurisdição de Alta Performance</p>
                                <p className="text-sm font-bold text-emerald-400">{growth_opportunities.top_jurisdiction}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Aumento Estimado</p>
                                <p className="text-lg font-black text-white">+{growth_opportunities.success_rate_increase}%</p>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <p className="text-[10px] uppercase font-bold text-emerald-400 mb-2 tracking-widest">Recomendação Estratégica</p>
                            <p className="text-lg font-black text-white mb-1">{growth_opportunities.recommended_specialization}</p>
                            <p className="text-xs text-slate-400 italic">Tendência identificada via Radar de Mercado & IA Preditora.</p>
                        </div>

                        <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
                            Ver Relatório de Inteligência Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
