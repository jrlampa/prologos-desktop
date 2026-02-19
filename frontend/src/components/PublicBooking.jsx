import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const PublicBooking = () => {
    const [types, setTypes] = useState({});
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Form State
    const [clientName, setClientName] = useState('');

    useEffect(() => {
        api.get('/agenda/types').then(res => setTypes(res.data?.data || {}));
    }, []);

    useEffect(() => {
        if (!selectedType) return;
        setLoading(true);
        api.get(`/agenda/slots?date=${selectedDate}`)
            .then(res => setSlots(res.data?.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedDate, selectedType]);

    const handleBooking = async (time) => {
        if (!clientName || !selectedType) return;
        try {
            await api.post('/agenda/book', {
                lawyer_id: 1,
                client_name: clientName,
                theme_key: selectedType,
                date: selectedDate,
                time: time
            });
            setBookingSuccess(true);
        } catch (err) {
            console.error("Booking failed", err);
            alert("Falha ao agendar. Tente novamente.");
        }
    };

    if (bookingSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full premium-glass p-8 rounded-2xl text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Agendamento Confirmado!</h2>
                    <p className="text-slate-600">
                        Obrigado, <strong>{clientName}</strong>.<br />
                        Sua reunião sobre <strong>{types[selectedType]?.label}</strong> está marcada para dia <strong>{new Date(selectedDate).toLocaleDateString('pt-BR')}</strong>.
                    </p>
                    <button
                        onClick={() => { setBookingSuccess(false); setSelectedType(null); }}
                        className="btn-premium w-full mt-4"
                    >
                        Novo Agendamento
                    </button>
                    <p className="text-xs text-slate-400 mt-4">Enviamos um e-mail com o link da reunião.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex items-center justify-center">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Left Side: Brand & Context */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter text-blue-600 uppercase">PRÓLOGOS</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Client Connect</p>
                    </div>
                    <div className="premium-glass p-6 rounded-2xl bg-white/60">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-lg overflow-hidden">
                                {/* Placeholder Avatar */}
                                <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-600"></div>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Dr. Jonathan Silva</h2>
                                <p className="text-sm text-slate-500">Sócio Sênior</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Bem-vindo à minha agenda digital. Selecione o motivo do seu contato ao lado para visualizar os horários disponíveis.
                        </p>
                    </div>
                </div>

                {/* Right Side: Booking Wizard */}
                <div className="premium-glass p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-xl relative overflow-hidden">
                    {!selectedType ? (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-700 mb-4">Qual o tema da reunião?</h3>
                            <div className="space-y-3">
                                {Object.entries(types).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedType(key)}
                                        className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-700 group-hover:text-blue-700">{config.label}</span>
                                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded group-hover:bg-blue-200 group-hover:text-blue-700">{config.duration} min</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <button
                                onClick={() => setSelectedType(null)}
                                className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 mb-4"
                            >
                                ← Voltar para Temas
                            </button>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Seu Nome Completo</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Ex: Maria Oliveira"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Data Preferida</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Horários Disponíveis</label>
                                {loading ? (
                                    <div className="text-center py-8 text-blue-500 font-bold animate-pulse">Buscando disponibilidade...</div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {slots.filter(s => s.available).map((slot, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!clientName}
                                                onClick={() => handleBooking(slot.time)}
                                                className="py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                        {slots.filter(s => s.available).length === 0 && (
                                            <div className="col-span-3 text-center py-4 text-slate-400 text-xs">
                                                Sem horários livres nesta data.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicBooking;
