import React from 'react';
import { Lightbulb, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { INCA_PREVENTION_TIPS } from '../data/incaTips';

interface Props {
  questionIndex?: number;
  className?: string;
  variant?: 'compact' | 'full';
}

export function DidYouKnowBanner({
  questionIndex = 0,
  className = '',
  variant = 'full',
}: Props) {
  // Pick tip corresponding to questionIndex or fallback
  const tip = INCA_PREVENTION_TIPS[questionIndex % INCA_PREVENTION_TIPS.length];

  return (
    <div
      className={`rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-purple-50/80 p-4 sm:p-5 shadow-sm text-left relative overflow-hidden transition-all ${className}`}
    >
      <div className="flex items-start gap-3 sm:gap-4 relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-purple-600/30">
          <Lightbulb className="w-5 h-5 text-amber-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Você sabia?
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {tip.emoji} {tip.category}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 mb-1">{tip.title}</h4>
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {tip.fact}
          </p>

          <div className="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              Fonte: {tip.source}
            </span>
            <span className="font-bold text-purple-700 hidden sm:inline">
              Diretrizes Oficiais do INCA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
