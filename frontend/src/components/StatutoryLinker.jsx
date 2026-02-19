import React from 'react';

const StatutoryLinker = ({ legalBasis }) => {
    if (!legalBasis || legalBasis.length === 0) {
        return (
            <div className="text-[10px] text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Controle de Legalidade: Nenhum artigo específico ancorado.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3">
            {legalBasis.map((basis, index) => (
                <a
                    key={index}
                    href={basis.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                >
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{basis.law || 'CPC/2015'}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                            <span className="text-xs font-black text-slate-800">{basis.article}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                            {basis.description}
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <svg className="w-4 h-4 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </div>
                </a>
            ))}

            <div className="mt-2 flex items-center gap-2 px-2">
                <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Verified by Sovereign Vade Mecum Engine</span>
            </div>
        </div>
    );
};

export default StatutoryLinker;
