import React, { useState } from 'react';
import { api } from '../services/api';

const GovEntitySearch = ({ initialQuery, onSearchDone }) => {
    const [cnpj, setCnpj] = useState(initialQuery || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialQuery) {
            setCnpj(initialQuery);
            handleSearch(null, initialQuery);
            if (onSearchDone) onSearchDone();
        }
    }, [initialQuery]);

    const handleSearch = async (e, overrideCnpj) => {
        if (e) e.preventDefault();
        const targetCnpj = overrideCnpj || cnpj;
        if (!targetCnpj) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Remove non-digits
            const cleanCnpj = targetCnpj.replace(/\D/g, '');
            const response = await api.get(`/gov/cnpj/${cleanCnpj}`);
            setResult(response.data.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Erro ao consultar CNPJ. Verifique se o número está correto.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        const text = `RAZÃO SOCIAL: ${result.razao_social}\nCNPJ: ${result.cnpj}\nENDEREÇO: ${result.endereco.logradouro}, ${result.endereco.numero} - ${result.endereco.bairro}, ${result.endereco.municipio}/${result.endereco.uf}, CEP: ${result.endereco.cep}`;
        navigator.clipboard.writeText(text);
        alert('Dados copiados para a área de transferência!');
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Search Box */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <img src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" alt="Gov.br" className="h-6 opacity-80" />
                    Consulta de Pessoa Jurídica (Receita Federal)
                </h3>
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CNPJ</label>
                        <input
                            type="text"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="00.000.000/0000-00"
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 font-mono outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] flex items-center gap-2 ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#1351B4] hover:bg-[#0c3c8b]'}`}
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        )}
                        Consultar Base Oficial
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            {/* Result Card */}
            {result && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-slate-800">{result.razao_social}</h2>
                                {result.situacao_cadastral === 'ATIVA' && (
                                    <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-bold border border-emerald-200">ATIVA</span>
                                )}
                            </div>
                            <p className="text-slate-500 font-mono text-sm">{result.nome_fantasia || 'Sem Nome Fantasia'}</p>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copiar para Petição
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Dados Cadastrais</h4>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-xs text-slate-500">CNPJ</dt>
                                    <dd className="text-sm font-bold text-slate-800 font-mono">{result.cnpj}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-slate-500">Natureza Jurídica</dt>
                                    <dd className="text-sm font-medium text-slate-800">{result.natureza_juridica}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-slate-500">Atividade Principal (CNAE)</dt>
                                    <dd className="text-sm font-medium text-slate-800">{result.cnae_principal}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-slate-500">Capital Social</dt>
                                    <dd className="text-sm font-medium text-slate-800">
                                        {result.capital_social ?
                                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.capital_social)
                                            : 'Não informado'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Endereço & Contato</h4>
                            <address className="not-italic text-sm text-slate-700 leading-relaxed">
                                {result.endereco.logradouro}, {result.endereco.numero} {result.endereco.complemento}<br />
                                {result.endereco.bairro}<br />
                                {result.endereco.municipio} - {result.endereco.uf}<br />
                                CEP: {result.endereco.cep}
                            </address>
                        </div>

                        {result.socios && result.socios.length > 0 && (
                            <div className="col-span-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Quadro Societário (QSA)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {result.socios.map((socio, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div className="text-sm font-bold text-slate-800">{socio.nome_socio || socio.nome}</div>
                                            <div className="text-xs text-slate-500">{socio.qualificacao_socio || socio.qualificacao}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovEntitySearch;
