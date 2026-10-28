import React from 'react';

interface Props {
  currentQuestionIndex: number; // 0 to 9
  totalQuestions?: number;
  className?: string;
  variant?: 'host' | 'player';
}

export function QuizProgressBar({
  currentQuestionIndex,
  totalQuestions = 10,
  className = '',
  variant = 'host',
}: Props) {
  const currentStep = Math.min(totalQuestions, Math.max(1, currentQuestionIndex + 1));
  const progressPercent = Math.round((currentStep / totalQuestions) * 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Top Labels Row */}
      <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full text-[11px]">
            Pergunta {currentStep} de {totalQuestions}
          </span>
          {variant === 'host' && (
            <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
              Sequência Oficial do INCA
            </span>
          )}
        </div>
        <span className="text-[11px] font-black text-purple-700 tabular-nums">
          {progressPercent}% concluído
        </span>
      </div>

      {/* 10 Segmented Step Blocks */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 h-2 sm:h-2.5 w-full">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCompleted = idx < currentQuestionIndex;
          const isCurrent = idx === currentQuestionIndex;

          return (
            <div
              key={idx}
              title={`Pergunta ${idx + 1}`}
              className={`rounded-full transition-all duration-300 relative overflow-hidden ${
                isCompleted
                  ? 'bg-purple-600 shadow-sm'
                  : isCurrent
                  ? 'bg-purple-400 ring-2 ring-purple-500 ring-offset-1 animate-pulse shadow-sm'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
