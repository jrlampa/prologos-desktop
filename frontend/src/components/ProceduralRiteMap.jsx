import React from 'react';

const ProceduralRiteMap = ({ currentPhase, riteType, nextStep }) => {
    const phases = [
        { id: 'Postulatório', label: 'Postulatório', icon: '📝' },
        { id: 'Saneamento', label: 'Saneamento', icon: '⚖️' },
        { id: 'Instrução', label: 'Instrução', icon: '🔍' },
        { id: 'Decisório', label: 'Decisório', icon: '🔨' },
        { id: 'Recursal', label: 'Recursal', icon: '⬆️' },
        { id: 'Execução', label: 'Execução', icon: '💰' }
    ];

    const getCurrentIndex = () => phases.findIndex(p => p.id === currentPhase);
    const currentIndex = getCurrentIndex();

    return (
        <div className="py-6 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Ritual Detectado</h4>
                    <div className="text-sm font-black text-slate-800">{riteType || 'Procedimento Comum'}</div>
                </div>
                <div className="text-right">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Próximo Rito</h4>
                    <div className="text-sm font-black text-slate-800">{nextStep || 'Aguardando Análise'}</div>
                </div>
            </div>

            <div className="relative flex justify-between items-start">
                {/* Connection Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-1000"
                        style={{ width: `${(currentIndex / (phases.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {phases.map((phase, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={phase.id} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                h-10 w-10 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-500
                                ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' :
                                    isCurrent ? 'bg-white border-indigo-500 text-indigo-600 scale-125 shadow-xl shadow-indigo-500/10' :
                                        'bg-white border-slate-200 text-slate-300'}
                            `}>
                                {isCompleted ? '✓' : phase.icon}
                            </div>
                            <div className={`mt-4 text-[8px] font-black uppercase tracking-tighter ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {phase.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {currentIndex === -1 && (
                <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold italic">
                        A IA não conseguiu mapear o ritual exato desta publicação.
                        Pode se tratar de um rito especial ou instância superior.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProceduralRiteMap;
