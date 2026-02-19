import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const STAGES = {
    TRIAGE: { label: 'Triagem', color: 'border-slate-500' },
    DRAFTING: { label: 'Redação', color: 'border-blue-500' },
    REVIEW: { label: 'Revisão', color: 'border-amber-500' },
    PROTOCOL: { label: 'Protocolo', color: 'border-purple-500' },
    DONE: { label: 'Concluído', color: 'border-emerald-500' }
};

const STAGE_ORDER = ['TRIAGE', 'DRAFTING', 'REVIEW', 'PROTOCOL', 'DONE'];

const CaseKanban = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newCaseTitle, setNewCaseTitle] = useState('');
    const [selectedCases, setSelectedCases] = useState([]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const res = await api.get('/workflow/cases');
            setCases(res.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch cases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const handleCreateCase = async (e) => {
        e.preventDefault();
        if (!newCaseTitle) return;
        try {
            await api.post('/workflow/cases', {
                title: newCaseTitle,
                description: "Descrição inicial do caso...",
                responsible_id: 1,
                value: 0.0
            });
            setNewCaseTitle('');
            fetchCases();
        } catch (err) {
            console.error("Failed to create case", err);
        }
    };

    const handleMoveCase = async (caseId, currentStage) => {
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        if (currentIndex >= STAGE_ORDER.length - 1) return;

        const nextStage = STAGE_ORDER[currentIndex + 1];
        try {
            await api.post(`/workflow/cases/${caseId}/move`, { target_stage: nextStage });
            fetchCases();
        } catch (err) {
            console.error("Failed to move case", err);
        }
    };

    const handleBulkMove = async (targetStage) => {
        if (selectedCases.length === 0) return;
        try {
            await api.post('/batch/move', {
                case_ids: selectedCases,
                target_stage: targetStage
            });
            setSelectedCases([]);
            fetchCases();
        } catch (err) {
            console.error("Failed to batch move", err);
        }
    };

    const toggleSelect = (id) => {
        setSelectedCases(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const getCasesByStage = (stage) => cases.filter(c => c.stage === stage);

    return (
        <div className="space-y-8 animate-fade-in h-[calc(100vh-12rem)] flex flex-col relative">
            {/* Header / Controls */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <form onSubmit={handleCreateCase} className="flex gap-4 w-full max-w-2xl">
                    <input
                        type="text"
                        value={newCaseTitle}
                        onChange={(e) => setNewCaseTitle(e.target.value)}
                        placeholder="Novo Caso (ex: Silva vs. Banco X)"
                        className="flex-grow bg-[#0c0f16] border border-white/10 text-white text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                    >
                        Criar Processo
                    </button>
                </form>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-mono">
                        {selectedCases.length > 0 ? `${selectedCases.length} selecionados` : '0 selecionados'}
                    </span>
                    <button onClick={fetchCases} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-grow overflow-x-auto overflow-y-hidden custom-scrollbar pb-20">
                <div className="flex gap-6 h-full min-w-max pb-4">
                    {STAGE_ORDER.map(stageKey => (
                        <div key={stageKey} className="w-72 flex flex-col">
                            <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${STAGES[stageKey].color}`}>
                                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{STAGES[stageKey].label}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-mono">
                                        {getCasesByStage(stageKey).length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow bg-white/5 rounded-2xl p-2 overflow-y-auto custom-scrollbar space-y-3">
                                {getCasesByStage(stageKey).map(c => (
                                    <div
                                        key={c.id}
                                        className={`p-4 rounded-xl border transition-all group relative ${selectedCases.includes(c.id) ? 'bg-blue-900/20 border-blue-500/50' : 'bg-[#0c0f16] border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCases.includes(c.id)}
                                                    onChange={() => toggleSelect(c.id)}
                                                    className="w-3 h-3 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-0 checked:bg-blue-500 cursor-pointer"
                                                />
                                                <span className="text-[9px] font-mono text-slate-500">#{c.id.toString().padStart(4, '0')}</span>
                                            </div>
                                            <span className="text-[9px] text-slate-600">{new Date(c.updated_at).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-200 leading-tight mb-3 pl-5">{c.title}</h4>

                                        <div className="flex items-center justify-between mt-auto pl-5">
                                            <div className="flex -space-x-1">
                                                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-[#0c0f16] flex items-center justify-center text-[8px] font-bold text-blue-400">JD</div>
                                            </div>

                                            {stageKey !== 'DONE' && (
                                                <button
                                                    onClick={() => handleMoveCase(c.id, stageKey)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white"
                                                    title="Avançar Etapa"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {getCasesByStage(stageKey).length === 0 && (
                                    <div className="h-full flex items-center justify-center opacity-20">
                                        <div className="text-center">
                                            <div className="w-12 h-1 border-t border-dashed border-slate-500 mx-auto mb-2"></div>
                                            <span className="text-[9px] uppercase tracking-widest text-slate-500">Vazio</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedCases.length > 0 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 premium-glass border border-blue-500/30 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-2xl z-50 animate-fade-in-up">
                    <span className="text-xs font-bold text-blue-400 whitespace-nowrap">{selectedCases.length} selecionados</span>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mr-2">Mover para:</span>
                        {STAGE_ORDER.map(stage => (
                            <button
                                key={stage}
                                onClick={() => handleBulkMove(stage)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-blue-500 hover:text-white text-slate-300 rounded-lg text-[10px] font-bold transition-all border border-white/5"
                            >
                                {STAGES[stage].label}
                            </button>
                        ))}
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <button
                        onClick={() => setSelectedCases([])}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CaseKanban;
