import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-xl mb-4 shadow-lg shadow-emerald-500/20">
                        <span className="text-3xl">⚖️</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Prólogos</h1>
                    <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest opacity-60">Sovereign Legal Intelligence</p>
                </div>

                <div className="space-y-6">
                    {/* Gov.br Button - Active Hub */}
                    <button
                        type="button"
                        className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-[#1351B4] font-black rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-3 border-2 border-transparent hover:border-[#1351B4]/10"
                        onClick={() => alert("Autenticação Soberana Gov.br ativa para contas Enterprise.")}
                    >
                        <img src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" alt="Gov.br" className="h-6" />
                        Acesso Soberano gov.br
                    </button>

                    <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-grow h-px bg-white/10"></div>
                        <span className="text-slate-500 text-xs uppercase tracking-wider">Ou acesso administrativo</span>
                        <div className="flex-grow h-px bg-white/10"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-300 text-xs font-medium mb-1.5 ml-1">Usuário</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                placeholder="ex: admin"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-xs font-medium mb-1.5 ml-1">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 transform hover:scale-[1.02] mt-4"
                        >
                            Entrar no Sistema
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">
                        &copy; 2026 Prólogos Enterprise. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
