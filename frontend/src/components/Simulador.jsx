import React, { useState } from 'react';
import { api } from '../services/api';
import TermsAcceptanceGate from './TermsAcceptanceGate';

const Simulador = ({
    juizId,
    dossie,
    termsAccepted,
    onToggleTermsAccepted,
    onOpenTerms,
}) => {
    const [file, setFile] = useState(null);
    const [analise, setAnalise] = useState('');
    const [loading, setLoading] = useState(false);
    const [parecer, setParecer] = useState('');
    const [parecerLoading, setParecerLoading] = useState(false);
    const [parecerError, setParecerError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalisar = () => {
        if (!file || !juizId) return;
        if (!termsAccepted) {
            onOpenTerms?.();
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        api.post('/analise/peticao', formData, {
            params: { juiz_id: juizId },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => setAnalise(res.data.parecer))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleParecer = () => {
        if (!file || !juizId) return;
        if (!termsAccepted) {
            onOpenTerms?.();
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (dossie) formData.append('dossie', dossie);

        setParecerLoading(true);
        setParecerError('');
        api.post('/analise/peticao/parecer', formData, {
            params: { juiz_id: juizId },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => setParecer(res.data.parecer))
            .catch(err => setParecerError(err?.response?.data?.detail || err?.message || 'Falha ao gerar parecer.'))
            .finally(() => setParecerLoading(false));
    };

    return (
        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 text-gradient inline-block">Simulador de Afinidade</h2>
            <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors duration-300">
                    <label htmlFor="peticao-upload" className="block mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Petição para Análise (PDF, DOCX, TXT)</label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="peticao-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="mb-2 text-sm text-gray-400">{file ? <span className="text-blue-400 font-medium">{file.name}</span> : <span className="font-semibold">Clique para enviar ou arraste</span>}</p>
                            </div>
                            <input type="file" id="peticao-upload" onChange={handleFileChange} className="hidden" accept=".pdf, .docx, .txt" />
                        </label>
                    </div>
                </div>

                <TermsAcceptanceGate
                    accepted={termsAccepted}
                    onChange={onToggleTermsAccepted}
                    onOpenTerms={onOpenTerms}
                    helperText="Para usar análises automatizadas/IA, confirme o aceite dos Termos de Uso."
                />

                <button
                    onClick={handleAnalisar}
                    disabled={!file || loading || !termsAccepted}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Processando Vetores...
                        </span>
                    ) : 'Analisar Afinidade Técnica'}
                </button>

                {analise && (
                    <div className="mt-4 bg-gray-700 p-4 rounded">
                        <h3 className="font-bold mb-2">Resultado da Análise:</h3>
                        <pre className="whitespace-pre-wrap text-sm">{analise}</pre>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-xl font-bold mb-2">Consultor Jurídico IA (Groq)</h3>
                    <p className="text-sm text-gray-300 mb-3">
                        Gera um parecer estratégico (opcionalmente usando o dossiê do juiz).
                    </p>

                    <button
                        onClick={handleParecer}
                        disabled={!file || parecerLoading || !termsAccepted}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                    >
                        {parecerLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Consultando LLM...
                            </span>
                        ) : 'Gerar Parecer Estratégico'}
                    </button>

                    {parecerError && (
                        <div className="mt-4 bg-red-900/40 border border-red-800 p-3 rounded">
                            <p className="text-sm text-red-200">{parecerError}</p>
                        </div>
                    )}

                    {parecer && (
                        <div className="mt-6 bg-black/30 p-5 rounded-xl border border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-300 text-sm uppercase tracking-widest">Parecer IA</h4>
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">Groq Llama 3</span>
                            </div>
                            <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {parecer}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulador;
