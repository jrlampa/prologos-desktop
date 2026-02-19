import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLegalStrategy } from '../hooks/useLegalStrategy';
import ProceduralRiteMap from './ProceduralRiteMap';
import StatutoryLinker from './StatutoryLinker';
import StrategyKanban from './StrategyKanban';
import FilingControlHub from './FilingControlHub';

const AIAnalystPanel = ({ record: initialRecord, isOpen, onClose, isLoading: initialLoading }) => {
    const {
        record,
        activeTab,
        isDialecticLoading,
        isFilingHubOpen,
        setIsFilingHubOpen,
        switchTab,
        riskIndicator
    } = useLegalStrategy(initialRecord);

    if (!isOpen || !record) return null;

    const getRiskStyles = (risk) => {
        switch (risk) {
            case 'CRITICAL': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-2xl bg-white shadow-2xl animate-slide-in-right flex flex-col relative overflow-hidden">

                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`h-2 w-2 rounded-full ${initialLoading || isDialecticLoading ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600'}`}></span>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Sovereign Strategy AI v5.0</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Hub Estratégico</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="px-8 pt-4 flex gap-6 border-b border-slate-100 bg-slate-50/30">
                        <button
                            onClick={() => switchTab('insights')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'insights' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2-2-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                                Análise Técnica
                            </span>
                            {activeTab === 'insights' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                        </button>
                        <button
                            onClick={() => switchTab('dialectic')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'dialectic' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                Dialética (IA)
                            </span>
                            {activeTab === 'dialectic' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-8 space-y-8 relative scrollbar-hide">
                        {activeTab === 'insights' ? (
                            initialLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Ancorando Argumentos...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Procedural Ritual Map */}
                                    <section className="p-1 bg-slate-50 rounded-2xl border border-slate-100">
                                        <ProceduralRiteMap
                                            currentPhase={record.procedural_phase}
                                            riteType={record.current_rite}
                                            nextStep={record.next_ritual_step}
                                        />
                                    </section>

                                    {/* Summary Section */}
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resumo Executivo</h4>
                                        <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 italic-text text-slate-700 leading-relaxed shadow-inner">
                                            {record.ai_summary || 'Análise em processamento...'}
                                        </div>
                                    </section>

                                    {/* Statutory Mesh */}
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fundamentação Legal (Mesh)</h4>
                                        <StatutoryLinker legalBasis={record.legal_basis} />
                                    </section>

                                    {/* Risk Score */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Score de Risco</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getRiskStyles(riskIndicator)}`}>
                                                {(record.ai_risk_score * 100).toFixed(0)}% {riskIndicator}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${record.ai_risk_score * 100}%` }}
                                                className={`h-full ${riskIndicator === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-indigo-500'}`}
                                            ></motion.div>
                                        </div>
                                    </section>
                                </>
                            )
                        ) : (
                            <section className="relative">
                                <div className="mb-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Simulação de Argumentação</h4>
                                    <p className="text-[10px] text-slate-500 font-medium italic">Antecipe a estratégia da oposição e valide sua tese jurídica.</p>
                                </div>
                                <StrategyKanban
                                    thesis={record.strategy_board?.thesis}
                                    antithesis={record.strategy_board?.antithesis}
                                    synthesis={record.strategy_board?.synthesis}
                                    isProcessing={isDialecticLoading}
                                />
                                {isDialecticLoading && (
                                    <div className="absolute inset-x-0 -top-4 -bottom-4 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Cotejando Antítese...</span>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Filing Control Hub Overlay */}
                        <AnimatePresence>
                            {isFilingHubOpen && (
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="absolute inset-0 z-50 bg-white"
                                >
                                    <FilingControlHub
                                        record={record}
                                        onClose={() => setIsFilingHubOpen(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                        {!isFilingHubOpen ? (
                            <button
                                onClick={() => setIsFilingHubOpen(true)}
                                className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Iniciar Protocolo MNI 2.0
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsFilingHubOpen(false)}
                                className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Voltar para Estratégia
                            </button>
                        )}
                        <button onClick={onClose} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-slate-800 transition-colors">
                            Ocultar Painel Estratégico
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAnalystPanel;
