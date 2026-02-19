import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const MarketRadar = () => {
    const [radar, setRadar] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const [radarRes, compRes] = await Promise.all([
                    api.get('/market/radar'),
                    api.get('/market/comparison')
                ]);
                setRadar(radarRes.data?.data);
                setComparison(compRes.data?.data);
            } catch (e) {
                console.error("Market Data Load Failure", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketData();
    }, []);

    if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded-xl"></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="premium-glass p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Radar de Mercado (Live)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 mb-1">Adoção de IA no Setor</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">{(radar?.ai_adoption_index * 100).toFixed(1)}%</span>
                            <span className="text-emerald-400 text-xs font-medium mb-1">↑ 2.4%</span>
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 mb-1">Volatilidade Jurídica</p>
                        <span className="text-lg font-bold text-amber-400">{radar?.market_volatility}</span>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-slate-500 uppercase tracking-tighter mb-2">Tendências Jurimétricas</p>
                    <div className="flex flex-wrap gap-2">
                        {radar?.top_jurimetric_trends?.map((trend, i) => (
                            <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-slate-300 border border-white/10 uppercase">
                                {trend}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {comparison && (
                <div className="premium-glass p-6 rounded-2xl border-l-4 border-l-blue-500">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Seu Benchmark vs. Mercado</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">Sua Eficiência</p>
                            <p className="text-xl font-bold">{comparison.efficiency?.tenant}s</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Média Setor</p>
                            <p className="text-xl font-bold text-slate-500">{comparison.efficiency?.market_avg}s</p>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(comparison.efficiency?.market_avg / comparison.efficiency?.tenant) * 100}%` }}
                        ></div>
                    </div>
                    <p className="mt-3 text-[10px] text-emerald-400 uppercase font-bold tracking-widest text-center">
                        Dominando {100 - comparison.sector_ranking}% das Organizações do Setor
                    </p>
                </div>
            )}
        </div>
    );
};

export default MarketRadar;
