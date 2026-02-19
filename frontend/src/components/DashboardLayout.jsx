import React, { useCallback, useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import Simulador from './Simulador';
import LegalDisclaimer from './LegalDisclaimer';
import TermsModal from './TermsModal';
import MarketRadar from './MarketRadar';
import LegalDeadlineCalculator from './LegalDeadlineCalculator';
import JurisprudenceExplorer from './JurisprudenceExplorer';
import VadeMecumSmart from './VadeMecumSmart';
import LegalDraftingAssistant from './LegalDraftingAssistant';
import NotificationCenter from './NotificationCenter';
import CaseKanban from './CaseKanban';
import AgendaMaster from './AgendaMaster';
import PublicBooking from './PublicBooking';
import GovEntitySearch from './GovEntitySearch'; // New Component
import CertificatesDashboard from './CertificatesDashboard'; // New Component
import ExecutiveDashboard from './ExecutiveDashboard'; // New Component
import AuditDashboard from './AuditDashboard'; // New Component
import LitigationHub from './LitigationHub'; // New Component
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext'; // Import auth context

const TERMS_ACCEPTED_KEY = 'prologos_terms_acceptance_v1';
const TERMS_VERSION = '2026-01-25';

function DashboardLayout() {
    const [juizes, setJuizes] = useState([]);
    const [selectedJuiz, setSelectedJuiz] = useState('');
    const [juizStats, setJuizStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]); // Real-time feedback
    const [dossie, setDossie] = useState('');
    const [dossieLoading, setDossieLoading] = useState(false);
    const [dossieError, setDossieError] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, simulator, market, lawyer-pro, jurisprudence, workflow, agenda
    const [activeLawyerTool, setActiveLawyerTool] = useState('deadlines'); // deadlines, vademecum, drafting
    const [govSubTab, setGovSubTab] = useState('search'); // search, certificates
    const [showPublicBooking, setShowPublicBooking] = useState(false);
    const [govQuery, setGovQuery] = useState(''); // New state for pre-filling gov search

    // Auth Hook
    const { logout, user } = useAuth();

    useEffect(() => {
        const handleSwitchTab = (e) => {
            if (e.detail?.tab) {
                setActiveTab(e.detail.tab);
                if (e.detail.tab === 'gov-br' && e.detail.query) {
                    setGovQuery(e.detail.query);
                }
            }
        };
        window.addEventListener('switchTab', handleSwitchTab);
        return () => window.removeEventListener('switchTab', handleSwitchTab);
    }, []);

    useEffect(() => {
        api.get('/juizes').then(res => setJuizes(res.data));
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(TERMS_ACCEPTED_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const ok = parsed?.accepted === true && parsed?.version === TERMS_VERSION;
            setTermsAccepted(ok);
        } catch { }
    }, []);

    useEffect(() => {
        if (selectedJuiz) {
            setLoading(true);
            setDossie('');
            setDossieError('');
            api.get(`/juiz/${selectedJuiz}/stats`)
                .then(res => setJuizStats(res.data))
                .finally(() => setLoading(false));
        } else {
            setJuizStats(null);
            setDossie('');
            setDossieError('');
        }
    }, [selectedJuiz]);

    const handleGerarDossie = useCallback(async () => {
        if (!selectedJuiz || !termsAccepted) return;
        setDossieLoading(true);
        setDossieError('');
        try {
            const res = await api.post(`/juiz/${selectedJuiz}/dossie`);
            setDossie(res.data?.dossie || '');
        } catch (e) {
            setDossieError(e?.response?.data?.detail || e?.message || 'Falha ao gerar dossiê.');
        } finally {
            setDossieLoading(false);
        }
    }, [selectedJuiz, termsAccepted]);

    const handleToggleTermsAccepted = (next) => {
        setTermsAccepted(!!next);
        try {
            localStorage.setItem(TERMS_ACCEPTED_KEY, JSON.stringify({
                accepted: !!next,
                version: TERMS_VERSION,
                acceptedAt: next ? new Date().toISOString() : null,
            }));
        } catch { }
    };

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    if (showPublicBooking) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowPublicBooking(false)}
                    className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-50 hover:opacity-100 transition-opacity"
                >
                    Sair da Simulação
                </button>
                <PublicBooking />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
            {/* 1. Sidebar Industrial (Phase 21-23) */}
            <aside className="w-64 premium-glass border-r-0 flex flex-col items-center py-8 z-30 bg-white/40">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-black tracking-tighter text-blue-600 uppercase">PRÓLOGOS</h1>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Cérebro Jurídico</p>
                </div>

                <nav className="w-full px-4 space-y-2 flex-grow">
                    <button
                        onClick={() => setActiveTab('executive')}
                        className={`sidebar-link w-full ${activeTab === 'executive' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Painel Executivo
                    </button>
                    <button
                        onClick={() => setActiveTab('litigation')}
                        className={`sidebar-link w-full ${activeTab === 'litigation' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        Hub de Litigância
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`sidebar-link w-full ${activeTab === 'analytics' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Jurimetria & KPIs
                    </button>
                    {(user?.role === 'admin' || user?.role === 'auditor') && (
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`sidebar-link w-full ${activeTab === 'audit' ? 'active' : ''}`}
                        >
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04kM12 21.48l.344-1.571a11.952 11.952 0 01-4.572-3.67M12 21.48l-.344-1.571a11.952 11.952 0 004.572-3.67M12 21.48c.345 0 .69-.03 1.033-.09M12 21.48c-.345 0-.69-.03-1.033-.09" /></svg>
                            Auditoria Forense
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('simulator')}
                        className={`sidebar-link w-full ${activeTab === 'simulator' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Simulador Jurídico
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`sidebar-link w-full ${activeTab === 'market' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Radar de Mercado
                    </button>
                    <button
                        onClick={() => setActiveTab('lawyer-pro')}
                        className={`sidebar-link w-full ${activeTab === 'lawyer-pro' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 01-6.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                        Central do Advogado
                    </button>
                    <button
                        onClick={() => setActiveTab('jurisprudence')}
                        className={`sidebar-link w-full ${activeTab === 'jurisprudence' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Jurisprudência Neural
                    </button>
                    <button
                        onClick={() => setActiveTab('workflow')}
                        className={`sidebar-link w-full ${activeTab === 'workflow' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Gestão Processual
                    </button>
                    <button
                        onClick={() => setActiveTab('agenda')}
                        className={`sidebar-link w-full ${activeTab === 'agenda' ? 'active' : ''}`}
                    >
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Agenda 4.0
                    </button>
                    <button
                        onClick={() => setActiveTab('gov-br')}
                        className={`sidebar-link w-full ${activeTab === 'gov-br' ? 'active' : ''}`}
                    >
                        <img src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" className="w-5 h-auto opacity-70 filter grayscale hover:grayscale-0 transition-all" alt="Gov" />
                        Ecossistema Gov.br
                    </button>
                </nav>

                <div className="w-full px-6 pt-6 border-t border-slate-200/50 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors mb-2 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sair
                    </button>
                    <button
                        onClick={() => setShowPublicBooking(true)}
                        className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-colors mb-4 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Simular Cliente
                    </button>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Maturidade Sistêmica</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">Nível 28</span>
                            <div className="h-1 flex-grow bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[99%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 2. Conteúdo Principal */}
            <main className="flex-grow flex flex-col min-w-0 overflow-y-auto relative z-20 custom-scrollbar">
                {/* Cabeçalho Top */}
                <header className="h-20 premium-glass border-b-0 border-t-0 border-l-0 flex items-center justify-between px-10 sticky top-0 z-40 bg-white/60">
                    <h2 className="text-lg font-bold text-slate-700">
                        {activeTab === 'analytics' ? 'Gestão de Inteligência Jurimétrica' :
                            activeTab === 'simulator' ? 'Ambiente de Simulação de Vereditos' :
                                activeTab === 'market' ? 'Radar de Mercado & Tendências' :
                                    activeTab === 'lawyer-pro' ? 'Central do Advogado: Prerrogativas e Prazos' :
                                        activeTab === 'jurisprudence' ? 'Explorador de Jurisprudência Neural & Precedentes' :
                                            activeTab === 'workflow' ? 'Gestão de Fluxos e Prazos' :
                                                activeTab === 'agenda' ? 'Agenda 4.0 & Conectividade Cliente' :
                                                    'Gestão Jurídica'}
                    </h2>
                    <div className="flex items-center gap-4">
                        {!termsAccepted && (
                            <button
                                onClick={() => setTermsOpen(true)}
                                className="text-[10px] bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-full font-black animate-pulse"
                            >
                                PENDÊNCIA DE CONFORMIDADE
                            </button>
                        )}
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer hover:shadow-lg transition-all" title={user?.username || 'Usuário'}>
                            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'JS'}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto w-full">
                    {activeTab === 'executive' ? (
                        <div className="animate-fade-in">
                            <h2 className="text-3xl font-bold mb-8 text-gradient">Centro de Comando Soberano</h2>
                            <ExecutiveDashboard />
                        </div>
                    ) : activeTab === 'litigation' ? (
                        <div className="animate-fade-in">
                            <h2 className="text-3xl font-bold mb-8 text-gradient">Hub de Litigância Estratégica</h2>
                            <LitigationHub />
                        </div>
                    ) : activeTab === 'audit' ? (
                        <div className="animate-fade-in">
                            <h2 className="text-3xl font-bold mb-8 text-gradient">Sovereign Audit Trail</h2>
                            <AuditDashboard />
                        </div>
                    ) : activeTab === 'analytics' ? (
                        <div className="flex gap-8 items-start animate-fade-in">
                            {/* Coluna Esquerda: Estatísticas e Seleção */}
                            <div className="w-1/3 space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selecione o Magistrado</label>
                                    <select
                                        value={selectedJuiz}
                                        onChange={(e) => setSelectedJuiz(e.target.value)}
                                        className="bg-transparent border-none text-slate-700 text-lg rounded-xl focus:ring-0 block w-full p-3 font-medium outline-none cursor-pointer"
                                    >
                                        <option value="" className="bg-white">-- Selecione o magistrado para análise profunda --</option>
                                        {juizes.map(juiz => (
                                            <option key={juiz.id} value={juiz.id} className="bg-white">{juiz.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                {juizStats && (
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                                        <h3 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">KPIs DO MAGISTRADO</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-blue-50 rounded-xl">
                                                <div className="text-xs text-blue-500 font-bold mb-1">Taxa de Procedência</div>
                                                <div className="text-2xl font-black text-blue-700">{(juizStats.taxa_procedencia * 100).toFixed(0)}%</div>
                                            </div>
                                            <div className="p-3 bg-indigo-50 rounded-xl">
                                                <div className="text-xs text-indigo-500 font-bold mb-1">Tempo Médio</div>
                                                <div className="text-xl font-black text-indigo-700">{juizStats.tempo_medio_dias} dias</div>
                                            </div>
                                            <div className="text-xs text-slate-400 col-span-2 mt-2">
                                                Baseado em {juizStats.total_processos} processos analisados.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleGerarDossie}
                                    disabled={loading || !selectedJuiz || dossieLoading || !termsAccepted}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${loading || !selectedJuiz || dossieLoading || !termsAccepted
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'
                                        }`}
                                >
                                    {dossieLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processando Intel...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <span>Gerar Dossiê Estratégico</span>
                                        </>
                                    )}
                                </button>

                                {dossieError && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-pulse">
                                        ⚠️ {dossieError}
                                    </div>
                                )}
                            </div>

                            {/* Coluna Direita: Dossiê e Insights */}
                            <div className="w-2/3">
                                {dossie ? (
                                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <svg className="w-32 h-32 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </span>
                                            DOSSIÊ ESTRATÉGICO GERADO
                                        </h3>
                                        <div className="prose prose-slate max-w-none text-sm">
                                            <pre className="whitespace-pre-wrap font-mono text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                {dossie}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-10 border-2 border-dashed border-slate-200 rounded-2xl min-h-[400px]">
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <p className="font-bold text-sm uppercase tracking-widest">Aguardando solicitação de inteligência</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'simulator' ? (
                        <div className="animate-fade-in max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8 text-gradient">Simulador de Decisões Judiciais</h2>
                            <Simulador juizes={juizes} />
                        </div>
                    ) : activeTab === 'market' ? (
                        <div className="animate-fade-in max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8 text-gradient">Inteligência de Mercado</h2>
                            <MarketRadar />
                        </div>
                    ) : activeTab === 'lawyer-pro' ? (
                        <div className="animate-fade-in max-w-5xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gradient">Ferramentas para o Advogado</h2>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">OAB Pro Intelligence</span>
                            </div>

                            {/* Sub-Navegação de Ferramentas */}
                            <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
                                <button
                                    onClick={() => setActiveLawyerTool('deadlines')}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeLawyerTool === 'deadlines' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                                >
                                    CÁLCULO DE PRAZOS
                                </button>
                                <button
                                    onClick={() => setActiveLawyerTool('vademecum')}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeLawyerTool === 'vademecum' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                                >
                                    VADE MECUM SMART
                                </button>
                                <button
                                    onClick={() => setActiveLawyerTool('drafting')}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeLawyerTool === 'drafting' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                                >
                                    ASSISTENTE DE REDAÇÃO
                                </button>
                            </div>

                            {activeLawyerTool === 'deadlines' && (
                                <div className="max-w-3xl mx-auto">
                                    <LegalDeadlineCalculator />
                                </div>
                            )}
                            {activeLawyerTool === 'vademecum' && <VadeMecumSmart />}
                            {activeLawyerTool === 'drafting' && <LegalDraftingAssistant />}
                        </div>
                    ) : activeTab === 'jurisprudence' ? (
                        <div className="animate-fade-in max-w-5xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gradient">Jurisprudência & Precedentes</h2>
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/20 uppercase tracking-widest">Neural Search Engine</span>
                            </div>
                            <JurisprudenceExplorer />
                        </div>
                    ) : activeTab === 'workflow' ? (
                        <div className="animate-fade-in w-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gradient">Gestão de Processos (Kanban)</h2>
                            </div>
                            <CaseKanban />
                            <div className="mt-12">
                                <NotificationCenter />
                            </div>
                        </div>
                    ) : activeTab === 'agenda' ? (
                        <div className="animate-fade-in max-w-5xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gradient">Agenda 4.0</h2>
                            </div>
                            <AgendaMaster />
                        </div>
                    ) : activeTab === 'gov-br' ? (
                        <div className="animate-fade-in max-w-5xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-gradient">Ecossistema Gov.br</h2>
                                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-200">BETA</span>
                                </div>

                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setGovSubTab('search')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${govSubTab === 'search' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Qualificação PJ
                                    </button>
                                    <button
                                        onClick={() => setGovSubTab('certificates')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${govSubTab === 'certificates' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Central de CNDs
                                    </button>
                                </div>
                            </div>

                            {govSubTab === 'search' ? (
                                <GovEntitySearch initialQuery={govQuery} onSearchDone={() => setGovQuery('')} />
                            ) : (
                                <CertificatesDashboard />
                            )}
                        </div>
                    ) : null}
                </div>
            </main >

            <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
            <LegalDisclaimer
                accepted={termsAccepted}
                onToggleAccepted={handleToggleTermsAccepted}
                onOpenTerms={() => setTermsOpen(true)}
                className="fixed bottom-6 right-6 w-80 z-50 animate-fade-in shadow-2xl"
            />
            {/* Real-time Toasts Layer */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] space-y-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className={`px-6 py-3 rounded-2xl shadow-2xl border text-white text-sm font-bold flex items-center gap-3 animate-fade-in pointer-events-auto ${toast.type === 'error' ? 'bg-red-600 border-red-500' :
                        toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
                            'bg-slate-800 border-slate-700'
                        }`}>
                        {toast.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                        {toast.message}
                    </div>
                ))}
            </div>
        </div >
    );
}

export default DashboardLayout;
