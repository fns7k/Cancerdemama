import React from 'react';
import {
  X,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
} from 'lucide-react';
import { INCA_QUESTIONS } from '../data/questions';
import { QuestionStat, RoomState } from '../types/quiz';
import { ShapeIcon } from './KahootIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomState | null;
  onLaunchConfetti: () => void;
}

export function MatchSummaryModal({ isOpen, onClose, roomState, onLaunchConfetti }: Props) {
  if (!isOpen || !roomState) return null;

  const stats = roomState.questionStats || [];

  // Calculate question with highest error rate
  let mostMissedIdx = 0;
  let highestErrorRate = -1;
  let highestWrongCount = 0;

  stats.forEach((s, idx) => {
    if (s.totalAnswers > 0) {
      const errorRate = s.wrongAnswers / s.totalAnswers;
      if (errorRate > highestErrorRate) {
        highestErrorRate = errorRate;
        highestWrongCount = s.wrongAnswers;
        mostMissedIdx = idx;
      }
    }
  });

  // Fallback to question 8 (micro-ondas) or question 3 (genética) if no stats recorded yet
  const targetQ = INCA_QUESTIONS[mostMissedIdx] || INCA_QUESTIONS[7];
  const targetStat = stats[mostMissedIdx];

  const totalRoomAnswers = stats.reduce((acc, curr) => acc + curr.totalAnswers, 0);
  const totalCorrect = stats.reduce((acc, curr) => acc + curr.correctAnswers, 0);
  const roomAccuracy =
    totalRoomAnswers > 0 ? Math.round((totalCorrect / totalRoomAnswers) * 100) : 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Resumo da Partida</h2>
                <span className="text-[10px] font-extrabold uppercase bg-purple-600/50 text-purple-200 px-2 py-0.5 rounded-full">
                  INCA Foco Pedagógico
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Análise de desempenho e reforço do aprendizado sobre prevenção do câncer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Perguntas</span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">10 / 10</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <span className="text-[11px] font-bold text-purple-700 uppercase block">Precisão da Sala</span>
              <span className="text-2xl font-black text-purple-900 tabular-nums">{roomAccuracy}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">Participantes</span>
              <span className="text-2xl font-black text-emerald-900 tabular-nums">
                {roomState.players.length}
              </span>
            </div>
          </div>

          {/* MAIN HIGHLIGHT: Pergunta com Maior Índice de Erros */}
          <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/50 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 block">
                    Pergunta com Maior Índice de Erros
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {targetQ.title}
                  </h3>
                </div>
              </div>

              {targetStat && targetStat.totalAnswers > 0 && (
                <div className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-black shrink-0 tabular-nums">
                  {Math.round((targetStat.wrongAnswers / targetStat.totalAnswers) * 100)}% de erros
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 font-medium mb-3 italic">
              &quot;{targetQ.subtitle}&quot;
            </p>

            {/* Correct Answer vs Wrong Options highlight */}
            <div className="space-y-2 mb-4">
              {targetQ.options.map((opt) => {
                const isCorrect = opt.id === targetQ.correctOptionIndex;
                const count = targetStat ? targetStat.answerDistribution[opt.id] : 0;

                return (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-2 ring-emerald-400/40'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 ${opt.bgClass}`}
                      >
                        <ShapeIcon shape={opt.shape} className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong>Opção {opt.letter}:</strong> {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                          Correta ✅
                        </span>
                      )}
                      {targetStat && targetStat.totalAnswers > 0 && (
                        <span className="text-slate-400 tabular-nums font-semibold">
                          {count} votos
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official INCA Teaching Reinforcement Box */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-extrabold text-purple-900 uppercase tracking-wider block">
                  Por que esta questão é crucial para a prevenção?
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {targetQ.explanation}
                </p>
                {targetQ.incaSourceUrl && (
                  <a
                    href={targetQ.incaSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold underline pt-1"
                  >
                    Ver publicação oficial do INCA sobre este tema
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick List of All 10 Questions and accuracy */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              Desempenho Geral das 10 Perguntas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INCA_QUESTIONS.map((q, idx) => {
                const qStat = stats[idx];
                const acc =
                  qStat && qStat.totalAnswers > 0
                    ? Math.round((qStat.correctAnswers / qStat.totalAnswers) * 100)
                    : 80;

                const isHighestMiss = idx === mostMissedIdx;

                return (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isHighestMiss
                        ? 'border-rose-300 bg-rose-50/50 font-bold text-rose-950'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <span className="truncate pr-2">
                      #{idx + 1}. {q.title.split('—')[1]?.trim() || q.title}
                    </span>
                    <span
                      className={`tabular-nums font-black shrink-0 px-2 py-0.5 rounded-md ${
                        acc >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : acc >= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {acc}% acertos
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onLaunchConfetti}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Lançar Confetes 🎉
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Fechar Resumo
          </button>
        </div>
      </div>
    </div>
  );
}
