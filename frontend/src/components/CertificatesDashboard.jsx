import React, { useState } from 'react';

const CertificatesDashboard = () => {
    const [cnpj, setCnpj] = useState('');

    // Lista de certidões essenciais para advogados corporativos
    const certificates = [
        {
            id: 'federal',
            name: 'Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União',
            organ: 'Receita Federal / PGFN',
            url: 'https://servicos.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Consultar',
            type: 'Federal'
        },
        {
            id: 'trabalhista',
            name: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
            organ: 'Tribunal Superior do Trabalho',
            url: 'http://www.tst.jus.br/certidao',
            type: 'Trabalhista'
        },
        {
            id: 'fgts',
            name: 'Certificado de Regularidade do FGTS (CRF)',
            organ: 'Caixa Econômica Federal',
            url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
            type: 'FGTS'
        },
        {
            id: 'falencia',
            name: 'Certidão de Falência e Recuperação Judicial',
            organ: 'Tribunal de Justiça (UF)',
            url: 'https://www.tjrj.jus.br/servicos/certidoes', // Exemplo RJ
            type: 'Judicial'
        }
    ];

    const openOfficial = (url) => {
        // Em um sistema real, poderíamos tentar preencher via script/crawler
        // Aqui, abrimos o portal oficial para o advogado
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white mb-2">Central de Certidões Negativas (CND)</h3>
                        <p className="text-slate-400 text-sm">Emissão e monitoramento de regularidade fiscal e trabalhista.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="CNPJ para emissão rápida"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map(cert => (
                    <div key={cert.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${cert.type === 'Federal' ? 'bg-blue-100 text-blue-600' :
                                    cert.type === 'Trabalhista' ? 'bg-red-100 text-red-600' :
                                        cert.type === 'FGTS' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-slate-100 text-slate-600'
                                }`}>
                                {cert.type}
                            </span>
                            <div className="flex items-center gap-1 text-emerald-500">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold">Portal Disponível</span>
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                            {cert.name}
                        </h4>
                        <p className="text-xs text-slate-400 mb-6">{cert.organ}</p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => openOfficial(cert.url)}
                                className="flex-grow py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                Abrir Portal de Emissão
                            </button>
                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors" title="Agendar monitoramento automático">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-dashed border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-800">Prólogos Intelligence - Emissão via Crawler</h4>
                        <p className="text-xs text-blue-600/70">A funcionalidade de emissão automática via background crawler está em desenvolvimento para o plano Enterprise.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificatesDashboard;
