import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AgendaMaster = () => {
    const [types, setTypes] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load appointment types
        api.get('/agenda/types').then(res => setTypes(res.data?.data || {}));
    }, []);

    useEffect(() => {
        setLoading(true);
        // Load public slots for selected date (Internal view would see all, reusing public endpoint for demo)
        api.get(`/agenda/slots?date=${selectedDate}`)
            .then(res => setSlots(res.data?.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedDate]);

    return (
        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Agenda 4.0</h2>
                    <p className="text-slate-500 font-medium">Gestão Inteligente de Tempo & Conectividade</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="premium-glass bg-white/50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    />
                    <button className="btn-premium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Bloquear Horário
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics / Config */}
                <div className="space-y-6">
                    <div className="premium-glass p-6 rounded-2xl hover-card">
                        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Tipos de Atendimento
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(types).map(([key, config]) => (
                                <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="text-sm font-bold text-slate-600">{config.label}</span>
                                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{config.duration} min</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-glass p-6 rounded-2xl hover-card bg-gradient-to-br from-indigo-50 to-white">
                        <h3 className="text-lg font-bold text-slate-700 mb-4">Link Público</h3>
                        <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-xs text-slate-400 font-mono truncate">prologos.law/agenda/dr-silva</span>
                            <button className="text-blue-600 hover:text-blue-800 ml-auto">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                            Compartilhe este link com seus clientes para permitir o auto-agendamento baseado nas regras definidas acima.
                        </p>
                    </div>
                </div>

                {/* Calendar / Slots View */}
                <div className="lg:col-span-2">
                    <div className="premium-glass p-6 rounded-2xl min-h-[500px]">
                        <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Visão do Dia ({new Date(selectedDate).toLocaleDateString('pt-BR')})
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {slots.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border text-center transition-all ${slot.available
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer hover:shadow-md'
                                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="text-lg font-black tracking-tight block">{slot.time}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                            {slot.available ? 'Livre' : 'Ocupado'}
                                        </span>
                                    </div>
                                ))}
                                {slots.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-400">
                                        Nenhum horário disponível para esta data.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgendaMaster;
