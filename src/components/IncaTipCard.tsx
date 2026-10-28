import React, { useState } from 'react';
import { Lightbulb, RotateCw, Sparkles, BookOpen } from 'lucide-react';
import { INCA_PREVENTION_TIPS, IncaTip, getRandomIncaTip } from '../data/incaTips';

interface Props {
  className?: string;
}

export function IncaTipCard({ className = '' }: Props) {
  const [currentTip, setCurrentTip] = useState<IncaTip>(() => getRandomIncaTip());
  const [isRotating, setIsRotating] = useState(false);

  const handleNextTip = () => {
    setIsRotating(true);
    let nextTip: IncaTip;
    do {
      nextTip = getRandomIncaTip();
    } while (nextTip.id === currentTip.id && INCA_PREVENTION_TIPS.length > 1);

    setCurrentTip(nextTip);
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <div
      className={`rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/90 via-white to-purple-50/50 p-4 text-left shadow-sm relative overflow-hidden transition-all ${className}`}
    >
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-base" role="img" aria-label="emoji">
            {currentTip.emoji}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
              Dica de Saúde do INCA
            </span>
            <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
              • {currentTip.category}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextTip}
          className="p-1 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-100/70 transition-colors flex items-center gap-1 text-[11px] font-bold"
          title="Ver outra dica do INCA"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="text-[10px]">Outra Dica</span>
        </button>
      </div>

      {/* Fact body */}
      <div className="relative z-10">
        <h4 className="text-xs font-bold text-slate-900 mb-1">{currentTip.title}</h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">{currentTip.fact}</p>

        {/* Source Footer */}
        <div className="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-purple-500 shrink-0" />
            Fonte Oficial: {currentTip.source}
          </span>
          <span className="text-purple-600 font-semibold">Prevenção = Vida</span>
        </div>
      </div>
    </div>
  );
}
