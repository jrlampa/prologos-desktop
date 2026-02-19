import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilingControlHub = ({ record, onFilingComplete, onClose }) => {
    const [petitionContent, setPetitionContent] = useState(record.strategy_board?.synthesis || '');
    const [isPinging, setIsPinging] = useState(false);
    const [courtStatus, setCourtStatus] = useState('unknown'); // 'online', 'offline', 'unknown'
    const [selectedCert, setSelectedCert] = useState('cert_001');
    const [filingStep, setFilingStep] = useState('idle'); // 'idle', 'normalizing', 'signing', 'transmitting', 'success', 'error'
    const [protocol, setProtocol] = useState(null);

    const checkConnectivity = async () => {
        setIsPinging(true);
        try {
            // Simulated ping check (Real logic would call backend /mni/ping)
            const isUp = Math.random() > 0.2;
            setCourtStatus(isUp ? 'online' : 'offline');
        } finally {
            setIsPinging(false);
        }
    };

    useEffect(() => {
        checkConnectivity();
    }, []);

    const handleLaunch = async () => {
        setFilingStep('normalizing');

        try {
            // 1. Normalizing & Composing
            await new Promise(r => setTimeout(r, 1000));
            setFilingStep('signing');

            // 2. Signing
            await new Promise(r => setTimeout(r, 1500));
            setFilingStep('transmitting');

            // 3. Submitting to MNI
            const response = await fetch('/api/v1/legal-ai/sign-and-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    internal_id: record.process_number || 'INIT-001',
                    tribunal: record.tribunal || 'TJSP',
                    manual_content: petitionContent,
                    cert_id: selectedCert
                })
            });

            if (!response.ok) throw new Error("Filing bridge failed");
            const data = await response.json();

            setProtocol(data.protocol);
            setFilingStep('success');
            if (onFilingComplete) onFilingComplete(data);
        } catch (error) {
            console.error(error);
            setFilingStep('error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
            {/* Control Strip */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${courtStatus === 'online' ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Status do Tribunal</h4>
                        <p className="text-xs font-bold">{courtStatus === 'online' ? 'TJSP Conectado via MNI 2.0' : 'Tribunal Indisponível (Retry auto)'}</p>
                    </div>
                </div>
                <button onClick={checkConnectivity} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <svg className={`w-4 h-4 text-slate-400 ${isPinging ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            {/* Editor Hub */}
            <div className="flex-grow p-8 flex flex-col gap-6">
                <div className="flex-grow flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Minuta da Petição (ABNT Bridge)</label>
                    <textarea
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs text-slate-300 font-medium leading-relaxed resize-none focus:ring-1 focus:ring-indigo-500/50 outline-none scrollbar-hide shadow-inner italic"
                        placeholder="Componha sua petição aqui..."
                        value={petitionContent}
                        onChange={(e) => setPetitionContent(e.target.value)}
                    />
                </div>

                {/* Certificate Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer hover:border-indigo-500/50 transition-all border-l-4 border-l-indigo-500">
                        <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A3.323 3.323 0 0010.605 4L9 4.5 7.395 4a3.323 3.323 0 00-4.618 3.366 3.323 3.323 0 001.077 2.454l3.923 3.923 3.923-3.923a3.323 3.323 0 001.077-2.454z" /></svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Certificado Ativo</p>
                            <p className="text-[10px] font-bold text-slate-200">Token SafeNet (A3)</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-800/10 border border-slate-800 rounded-xl flex items-center gap-3 opacity-50 grayscale">
                        <div className="h-8 w-8 bg-slate-700 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Backup (A1)</p>
                            <p className="text-[10px] font-bold text-slate-600">Off-line/Vencido</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Launch Action */}
            <div className="p-8 bg-slate-950 border-t border-slate-800 relative">
                <AnimatePresence mode="wait">
                    {filingStep === 'idle' ? (
                        <motion.button
                            key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={handleLaunch}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl ${courtStatus === 'online' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            disabled={courtStatus !== 'online'}
                        >
                            Assinar e Lançar Petição
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </motion.button>
                    ) : filingStep === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-2"
                        >
                            <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Petição Protocolada!</h5>
                            <p className="text-[10px] font-bold text-white mb-2">Protocolo: {protocol}</p>
                            <button onClick={onClose} className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Fechar Controle</button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col items-center py-4"
                        >
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: filingStep === 'normalizing' ? '30%' : filingStep === 'signing' ? '60%' : '90%' }}
                                    transition={{ duration: 1.5 }}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">
                                    {filingStep === 'normalizing' ? 'Normalizando ABNT...' : filingStep === 'signing' ? 'Assinando via Crypto-Bridge...' : 'Transmitindo via MNI 2.0...'}
                                </span>
                            </div>
                        </motion.div>
                    )
                    }
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FilingControlHub;
