import React, { useState } from 'react';
import { api } from '../services/api';

const ClientCommunicator = ({ caseContext }) => {
    const [phone, setPhone] = useState(caseContext?.client_phone || '');
    const [template, setTemplate] = useState('update');
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const templates = {
        update: "Olá! Informamos que houve uma nova movimentação no seu processo. Estamos analisando o teor e entraremos em contato em breve.",
        success: "Boas notícias! Tivemos uma decisão favorável no seu processo. Agendaremos uma reunião para explicar os próximos passos.",
        delay: "Aviso: O prazo processual foi suspenso temporariamente pelo tribunal. Manteremos você informado."
    };

    const handleSend = async () => {
        setLoading(true);
        setResult(null);
        try {
            const msg = customMessage || templates[template];
            await api.post('/communication/notify-client', {
                client_phone: phone,
                message: msg,
                channels: ["whatsapp"]
            });
            setResult({ type: 'success', text: 'Mensagem enviada com sucesso!' });
        } catch (err) {
            setResult({ type: 'error', text: 'Falha ao enviar mensagem.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="premium-glass p-6 rounded-2xl border border-white/10 animate-fade-in my-6">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                Notificar Cliente (WhatsApp)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Telefone (com DDD)</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 11999998888"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Cenário</label>
                    <select
                        value={template}
                        onChange={(e) => {
                            setTemplate(e.target.value);
                            setCustomMessage('');
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                        <option value="update">Atualização Geral</option>
                        <option value="success">Decisão Favorável</option>
                        <option value="delay">Suspensão/Prazo</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Pré-visualização da Mensagem</label>
                <textarea
                    value={customMessage || templates[template]}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-slate-300 text-sm h-24 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                />
            </div>

            <button
                onClick={handleSend}
                disabled={loading || !phone}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Enviando...' : 'Enviar Notificação Agora'}
                {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            </button>

            {result && (
                <div className={`mt-3 p-3 rounded-lg text-xs font-bold text-center ${result.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {result.text}
                </div>
            )}
        </div>
    );
};

export default ClientCommunicator;
