import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StrategyKanban = ({ thesis = '', antithesis = '', synthesis = '', anchors = [], onGenerate }) => {
    const [localThesis, setLocalThesis] = useState(thesis);

    const columns = [
        { id: 'thesis', title: 'Tese (Argumento)', content: thesis, color: 'bg-indigo-50 border-indigo-100', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { id: 'antithesis', title: 'Antítese (IA)', content: antithesis, color: 'bg-rose-50 border-rose-100', icon: 'M9 12l2 2 4-4m5.618-4.016A3.323 3.323 0 0010.605 4L9 4.5 7.395 4a3.323 3.323 0 00-4.618 3.366 3.323 3.323 0 001.077 2.454l3.923 3.923 3.923-3.923a3.323 3.323 0 001.077-2.454z' },
        { id: 'synthesis', title: 'Síntese (Estratégia)', content: synthesis, color: 'bg-emerald-50 border-emerald-100', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {columns.map((col) => (
                    <div key={col.id} className="min-w-[280px] flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center gap-2 px-2">
                            <div className={`h-6 w-6 rounded-lg ${col.color} flex items-center justify-center`}>
                                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={col.icon} /></svg>
                            </div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{col.title}</h5>
                        </div>

                        <div className={`p-5 rounded-2xl border ${col.color} shadow-sm min-h-[120px] relative group overflow-hidden`}>
                            {col.id === 'thesis' && !thesis ? (
                                <textarea
                                    className="w-full bg-transparent border-none text-xs font-medium text-slate-700 placeholder-slate-400 focus:ring-0 resize-none h-24"
                                    placeholder="Digite sua tese aqui..."
                                    value={localThesis}
                                    onChange={(e) => setLocalThesis(e.target.value)}
                                />
                            ) : (
                                <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
                                    {col.content || <span className="text-slate-400 uppercase tracking-tighter font-black animate-pulse">Aguardando Dialética...</span>}
                                </p>
                            )}

                            {col.id === 'thesis' && !thesis && (
                                <button
                                    onClick={() => onGenerate(localThesis)}
                                    className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors"
                                >
                                    Provocar Dialética
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {anchors && anchors.length > 0 && (
                <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Âncoras de Síntese</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {anchors.map((anchor, i) => (
                            <a
                                key={i}
                                href={anchor.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/30 transition-all group"
                            >
                                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">
                                    <span className="text-emerald-400 mr-2">{anchor.law}</span> {anchor.article}
                                </span>
                                <svg className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrategyKanban;
