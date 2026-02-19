import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ProfitabilityDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const resp = await api.get('/analytics/dashboard');
                setMetrics(resp.data.data);
            } catch (e) {
                console.error("BI Error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="text-center text-slate-400 p-10 animate-pulse">Calculando ROI...</div>;
    if (!metrics) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-200">Business Intelligence</h2>
                    <p className="text-slate-400 text-sm">Raio-X de Lucratividade e Performance Jurídica.</p>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-glass p-6 rounded-2xl border border- emerald-500/20 bg-emerald-900/10">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Faturamento (YTD)</p>
                    <p className="text-3xl font-mono text-white">R$ {metrics.financial.revenue_ytd.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-emerald-500/80 mt-2 font-medium">▲ Projetado Q4: R$ {metrics.financial.projected_q4.toLocaleString('pt-BR')}</p>
                </div>

                <div className="premium-glass p-6 rounded-2xl border border-blue-500/20 bg-blue-900/10">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Taxa de Êxito</p>
                    <p className="text-3xl font-mono text-white">{metrics.performance.win_rate}%</p>
                    <p className="text-xs text-blue-500/80 mt-2 font-medium">{metrics.performance.cases_closed} Casos Julgados</p>
                </div>

                <div className="premium-glass p-6 rounded-2xl border border-purple-500/20 bg-purple-900/10">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Ticket Médio</p>
                    <p className="text-3xl font-mono text-white">R$ {metrics.financial.avg_ticket.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-purple-500/80 mt-2 font-medium">Honorários por Contrato</p>
                </div>
            </div>

            {/* Matrix & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="premium-glass p-6 rounded-2xl border border-white/10">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Matriz de Oportunidade</h3>
                    <div className="space-y-3">
                        {metrics.matrix.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div>
                                    <p className="text-sm text-white font-medium">{item.case}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${item.prob > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        Prob. {item.prob}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-slate-300">R$ {item.value.toLocaleString('pt-BR')}</p>
                                    <p className="text-[10px] text-slate-500">{item.effort} effort</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-glass p-6 rounded-2xl border border-white/10">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Insights Estratégicos (AI)</h3>
                    <ul className="space-y-4">
                        {metrics.insights.map((insight, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                                <div className="min-w-[24px] h-[24px] rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold mt-0.5">
                                    AI
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfitabilityDashboard;
