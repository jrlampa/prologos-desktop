import React, { useState } from 'react';
import { api } from '../services/api';

const FinancialDashboard = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Honorários Advocatícios');
    const [clientName, setClientName] = useState('');
    const [generatedPix, setGeneratedPix] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pixKey, setPixKey] = useState('12345678900'); // Mock default, should come from config

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const resp = await api.post('/finance/pix/charge', {
                pix_key: pixKey,
                merchant_name: "ProLogos Law Firm", // Should come from user profile
                merchant_city: "Sao Paulo",
                amount: amount.replace(',', '.'),
                txtid: "HON" + Math.floor(Math.random() * 1000)
            });
            setGeneratedPix(resp.data.data);
        } catch (e) {
            console.error("Pix Gen Failed", e);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedPix?.payload) {
            navigator.clipboard.writeText(generatedPix.payload);
            alert("Código Pix Copia e Cola copiado!");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-200">Soberania Financeira</h2>
                    <p className="text-slate-400 text-sm">Emissão Instantânea de Honorários via Pix (Sem Taxas).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generation Form */}
                <div className="premium-glass p-6 rounded-2xl border border-white/10">
                    <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Nova Cobrança
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-lg font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chave Pix (Destino)</label>
                            <input
                                type="text"
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-emerald-400 text-sm font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !amount}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/40 transition-all mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Gerando BR Code...' : 'Gerar Cobrança Pix'}
                            {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        </button>
                    </div>
                </div>

                {/* Result / QR Code */}
                <div className="premium-glass p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
                    {!generatedPix ? (
                        <div className="text-center opacity-50">
                            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M19 19v-3m0 3h1m-1 0h-1m-1 0v-3m0 3h1m-1 0h-1m-1 0v-3m0 3h1m-1 0h-1M4 19v-3m0 3h1m-1 0h-1M4 21h1" /></svg>
                            <p className="text-slate-400 font-medium">Aguardando geração...</p>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center animate-scale-in">
                            <div className="bg-white p-4 rounded-xl shadow-2xl mb-6">
                                {/* Use a QR library in real app, here we simulate or use an API if available. 
                                    For now, showing a placeholder or text-based representation if base64 is null. 
                                    Since backend returned null for scan, we just show copy paste. */}
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-gray-300 rounded">
                                    [QR Code Visual]
                                </div>
                            </div>

                            <div className="w-full bg-black/50 rounded-lg p-4 border border-white/5 break-all font-mono text-xs text-emerald-300 mb-4">
                                {generatedPix.payload}
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                Copiar Código
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialDashboard;
