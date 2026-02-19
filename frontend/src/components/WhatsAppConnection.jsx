import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const WhatsAppConnection = () => {
    const [status, setStatus] = useState('unknown');
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkStatus = async () => {
        try {
            const resp = await api.get('/evolution/status');
            setStatus(resp.data.data.status || 'disconnected');
        } catch (e) {
            setStatus('error');
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        setQrCode(null);
        try {
            // 1. Ensure Instance Exists
            await api.post('/evolution/instance');

            // 2. Get QR Code
            const resp = await api.get('/evolution/connect');
            if (resp.data.data.base64) {
                setQrCode(resp.data.data.base64);
            } else if (resp.data.data.code) {
                // Sometimes it returns just the code
                setQrCode(resp.data.data.code);
            } else {
                setError("Não foi possível obter o QR Code. Instância já conectada?");
                checkStatus();
            }
        } catch (err) {
            setError("Falha ao iniciar conexão: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${status === 'open' || status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                Status da Conexão: {status === 'open' || status === 'connected' ? <span className="text-emerald-400">ONLINE</span> : <span className="text-red-400">DESCONECTADO</span>}
            </h3>

            {status !== 'open' && status !== 'connected' && (
                <div className="flex flex-col items-center">
                    {!qrCode ? (
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                        >
                            {loading ? 'Iniciando...' : 'Conectar Nova Instância'}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in">
                            <p className="text-slate-400 mb-4 text-sm">Escaneie o QR Code com seu WhatsApp:</p>
                            <div className="bg-white p-2 rounded-lg">
                                <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" className="w-64 h-64 object-contain" />
                            </div>
                            <button onClick={() => setQrCode(null)} className="mt-4 text-slate-500 hover:text-white text-xs underline">Cancelar</button>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</p>
                    )}
                </div>
            )}

            {(status === 'open' || status === 'connected') && (
                <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 text-center">
                    <p className="text-emerald-300 font-medium">✨ Instância ProLogos Ativa e Pronta para Uso.</p>
                    <p className="text-slate-400 text-xs mt-1">Sua soberania de dados está garantida.</p>
                </div>
            )}
        </div>
    );
};

export default WhatsAppConnection;
