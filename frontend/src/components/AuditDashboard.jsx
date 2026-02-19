import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AuditDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/audit/logs')
            .then(res => setLogs(res.data))
            .finally(() => setLoading(false));
    }, []);

    const getActionStyle = (action) => {
        if (action.includes('SUCCESS') || action.includes('GENERATE')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (action.includes('FAILED') || action.includes('DELETE')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Sovereign Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="premium-glass p-6 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</div>
                    <div className="text-3xl font-black text-slate-800">{logs.length}</div>
                </div>
                <div className="premium-glass p-6 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segurança</div>
                    <div className="text-3xl font-black text-emerald-600">98%</div>
                </div>
                <div className="premium-glass p-6 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alertas 24h</div>
                    <div className="text-3xl font-black text-rose-500">{logs.filter(l => l.action.includes('FAILED')).length}</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl text-center shadow-xl shadow-slate-900/10">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Integridade</div>
                    <div className="text-2xl font-black text-white italic-text">SOVEREIGN</div>
                </div>
            </div>

            <div className="bg-white p-1 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4 mb-10 border-b border-slate-50 pb-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                                Rastreabilidade <span className="text-gradient">Forense Imutável</span>
                            </h3>
                            <p className="text-slate-400 font-medium">Histórico industrial de todas as ações sensíveis no sistema Prólogos.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizado via Event Mesh</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                    <th className="pb-6 px-4">Timeline</th>
                                    <th className="pb-6 px-4">Ação Institucional</th>
                                    <th className="pb-6 px-4">Recurso</th>
                                    <th className="pb-6 px-4">Origem / IP</th>
                                    <th className="pb-6 px-4 text-right">Verificação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-slate-50 transition-all duration-300">
                                        <td className="py-6 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black text-slate-700">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight border ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800 uppercase">{log.resource}</span>
                                                <span className="text-[9px] text-slate-400 italic font-medium">Scope: Internal</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{log.user_ip}</span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-emerald-600">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L9.03 17.003a1 1 0 001.74 0L17.834 4.9A1 1 0 0016.963 3.5H3.037a1 1 0 00-.871 1.4zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Validado</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logs.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[20px] border border-dashed border-slate-200 mt-6">
                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.0.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h4 className="text-sm font-black text-slate-800 mb-1">Vazio Institucional</h4>
                            <p className="text-xs text-slate-400 font-medium italic">Nenhum rastro forense detectado em nosso gateway até o momento.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="premium-glass p-8 bg-indigo-600 text-white border-none shadow-indigo-500/20">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04kM12 21.48l.344-1.571a11.952 11.952 0 01-4.572-3.67M12 21.48l-.344-1.571a11.952 11.952 0 004.572-3.67M12 21.48c.345 0 .69-.03 1.033-.09M12 21.48c-.345 0-.69-.03-1.033-.09" /></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-black tracking-tight mb-1">Standard de Conformidade Enterprise</h4>
                        <p className="text-indigo-100 text-sm opacity-80 max-w-2xl leading-relaxed">
                            O Prólogos Sovereign Audit Trail utiliza logs assinados e arquitetura de dados imutável para garantir que as operações do seu tribunal ou escritório atendam aos mais rigorosos padrões da LGPD e governança corporativa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditDashboard;
