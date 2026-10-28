import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Play,
  UserPlus,
  ArrowRight,
  Trophy,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart2,
} from 'lucide-react';
import { INCA_QUESTIONS } from '../data/questions';
import { RoomState } from '../types/quiz';
import { ShapeIcon } from './KahootIcons';
import { sounds } from '../utils/sound';
import { MatchSummaryModal } from './MatchSummaryModal';
import { QuizProgressBar } from './QuizProgressBar';
import { DidYouKnowBanner } from './DidYouKnowBanner';

function launchCelebrationConfetti() {
  const defaults = { origin: { y: 0.65 }, zIndex: 9999 };

  confetti({
    ...defaults,
    particleCount: 90,
    spread: 70,
    startVelocity: 55,
  });
  confetti({
    ...defaults,
    particleCount: 80,
    spread: 100,
    origin: { x: 0.15, y: 0.6 },
  });
  confetti({
    ...defaults,
    particleCount: 80,
    spread: 100,
    origin: { x: 0.85, y: 0.6 },
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 120,
      spread: 120,
      startVelocity: 45,
    });
  }, 400);

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      ...defaults,
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  }, 800);
}

interface Props {
  roomState: RoomState | null;
  onStartGame: (pin: string) => void;
  onAddBots: (pin: string, count: number) => void;
  onNextQuestion: (pin: string) => void;
  onShowLeaderboard: (pin: string) => void;
  onRestart: (pin: string) => void;
  onOpenGuidelines: () => void;
  onForceCreateRoom?: () => void;
}

function AnimatedScoreCounter({ target, startFrom }: { target: number; startFrom: number }) {
  const [val, setVal] = useState(startFrom);

  useEffect(() => {
    let frameId: number;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // smooth easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(startFrom + (target - startFrom) * ease));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, startFrom]);

  return <span>{val.toLocaleString()}</span>;
}

export function HostView({
  roomState,
  onStartGame,
  onAddBots,
  onNextQuestion,
  onShowLeaderboard,
  onRestart,
  onOpenGuidelines,
  onForceCreateRoom,
}: Props) {
  const [copied, setCopied] = React.useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const lastStateStatusRef = useRef<string | null>(null);
  const prevTimeRef = useRef<number>(20);

  // Sound triggers on state changes
  useEffect(() => {
    if (!roomState) return;

    if (lastStateStatusRef.current !== roomState.status) {
      if (roomState.status === 'LOBBY') {
        sounds.startLobbyMusic();
      } else {
        sounds.stopLobbyMusic();
      }

      if (roomState.status === 'COUNTDOWN') {
        sounds.playCountdownBeep(roomState.timeRemaining);
      }

      if (roomState.status === 'QUESTION') {
        sounds.playTick(false);
      }

      if (roomState.status === 'REVEAL') {
        sounds.playCorrect();
      }

      if (roomState.status === 'LEADERBOARD') {
        sounds.playWhoosh();
      }

      if (roomState.status === 'PODIUM') {
        sounds.playVictoryFanfare();
        // Trigger rich multi-burst confetti celebration
        launchCelebrationConfetti();
      }

      lastStateStatusRef.current = roomState.status;
    }

    // Tick audio
    if (roomState.status === 'QUESTION' && roomState.timeRemaining !== prevTimeRef.current) {
      if (roomState.timeRemaining <= 5 && roomState.timeRemaining > 0) {
        sounds.playTick(true);
      } else if (roomState.timeRemaining > 0) {
        sounds.playTick(false);
      }
      prevTimeRef.current = roomState.timeRemaining;
    }

    if (roomState.status === 'COUNTDOWN' && roomState.timeRemaining !== prevTimeRef.current) {
      sounds.playCountdownBeep(roomState.timeRemaining);
      prevTimeRef.current = roomState.timeRemaining;
    }
  }, [roomState]);

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 max-w-md mx-auto animate-fadeIn">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Conectando à Sala do Kahoot...</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Carregando ambiente em tempo real (compatível com Vercel e servidores Node)
        </p>

        {onForceCreateRoom && (
          <button
            onClick={onForceCreateRoom}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Iniciar Sala Imediatamente
          </button>
        )}
      </div>
    );
  }

  const currentQ = INCA_QUESTIONS[roomState.currentQuestionIndex];
  const totalQuestions = INCA_QUESTIONS.length;
  const isLastQuestion = roomState.currentQuestionIndex === totalQuestions - 1;

  const copyPin = () => {
    navigator.clipboard.writeText(roomState.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- LOBBY VIEW ---
  if (roomState.status === 'LOBBY') {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        {/* Top Banner with PIN and Quick Info */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800 mb-8">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Sala do Projetor • Quiz INCA
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                Entre no jogo pelo celular ou navegador
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Acesse a aba <strong>&quot;Jogador&quot;</strong> ou digite o código PIN abaixo:
              </p>
            </div>

            {/* Giant PIN Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 text-center flex flex-col items-center">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">GAME PIN:</span>
              <div className="flex items-center gap-3 my-1">
                <span className="font-mono text-4xl sm:text-5xl font-black text-amber-300 tracking-widest tabular-nums">
                  {roomState.pin.slice(0, 3)} {roomState.pin.slice(3)}
                </span>
                <button
                  onClick={copyPin}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copiar PIN"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-300">
                {copied ? 'PIN copiado com sucesso!' : 'Clique para copiar o PIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Players Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Participantes Conectados: {roomState.players.length}
                </h2>
                <p className="text-xs text-slate-500">
                  {roomState.players.length === 0
                    ? 'Aguardando o primeiro jogador entrar...'
                    : 'Prontos para testar conhecimentos sobre prevenção do câncer!'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onAddBots(roomState.pin, 3)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
                title="Adiciona jogadores simulados para testar o quiz sozinho"
              >
                <UserPlus className="w-4 h-4" />
                +3 Jogadores Virtuais
              </button>

              <button
                onClick={() => onStartGame(roomState.pin)}
                disabled={roomState.players.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-purple-600/30"
              >
                <Play className="w-4 h-4 fill-current" />
                Iniciar Jogo
              </button>
            </div>
          </div>

          {/* Player badges grid */}
          {roomState.players.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-3 animate-pulse">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-slate-700">Nenhum jogador na sala ainda</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Abra a aba &quot;Jogador&quot; no menu superior para entrar pelo mesmo navegador, ou clique em &quot;+3 Jogadores Virtuais&quot; para iniciar uma demonstração agora mesmo!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-6">
              {roomState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all animate-scaleUp"
                >
                  <span className="text-2xl" role="img" aria-label="avatar">
                    {player.avatar}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{player.nickname}</p>
                    <span className="text-[10px] text-slate-500">
                      {player.isBot ? 'Virtual' : 'Conectado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Educational Banner with INCA Reference */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">Tema Oficial:</span>
            <span>Saúde e Prevenção do Câncer • 10 Perguntas • 20s cada</span>
          </div>
          <button
            onClick={onOpenGuidelines}
            className="flex items-center gap-1.5 text-purple-700 font-bold hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            Ver Fontes e Diretrizes do INCA
          </button>
        </div>
      </div>
    );
  }

  // --- COUNTDOWN VIEW (3, 2, 1) ---
  if (roomState.status === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 max-w-xl mx-auto">
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={totalQuestions}
          className="mb-6"
        />

        <span className="text-sm font-bold uppercase tracking-widest text-purple-600 mb-2">
          Prepare-se!
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6">
          Pergunta {roomState.currentQuestionIndex + 1} de {totalQuestions}
        </h2>
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-6xl sm:text-7xl shadow-2xl shadow-purple-600/40 animate-pingSlow">
          {roomState.timeRemaining}
        </div>
        <p className="text-sm font-medium text-slate-500 mt-6 max-w-sm">
          Fique atento às 4 cores e formas na tela do projetor e responda no seu dispositivo!
        </p>

        {/* 'Você sabia?' Educativo durante a contagem */}
        <DidYouKnowBanner
          questionIndex={roomState.currentQuestionIndex}
          className="mt-6 w-full"
        />
      </div>
    );
  }

  // --- QUESTION VIEW ---
  if (roomState.status === 'QUESTION' && currentQ) {
    const timeRatio = roomState.timeRemaining / (currentQ.timeLimitSeconds || 20);
    const isUrgent = roomState.timeRemaining <= 5;

    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col justify-between min-h-[82vh]">
        {/* Visual Progress Bar on Question View */}
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={totalQuestions}
          className="mb-4"
        />

        {/* Header: Question Progress & Timer */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              Pergunta {roomState.currentQuestionIndex + 1} de {totalQuestions}
            </span>

            {/* Response counter */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              <Users className="w-4 h-4 text-purple-600" />
              <span>
                {roomState.answerCount} / {roomState.players.length} respostas
              </span>
            </div>
          </div>

          {/* Question Title & Subtitle */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center mb-6">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {currentQ.title}
            </h2>
            {currentQ.subtitle && (
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-2">
                {currentQ.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Big Animated Timer & Live Count */}
        <div className="flex items-center justify-center my-2">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black text-3xl sm:text-4xl shadow-lg transition-colors tabular-nums ${
              isUrgent
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                : 'bg-slate-900 text-amber-300 shadow-slate-900/30'
            }`}
          >
            {roomState.timeRemaining}
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 -mt-1">
              seg
            </span>
          </div>
        </div>

        {/* 4 Colored Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {currentQ.options.map((option) => (
            <div
              key={option.id}
              className={`${option.bgClass} text-white rounded-2xl p-4 sm:p-6 flex items-center gap-4 shadow-md transition-all relative overflow-hidden`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                <ShapeIcon shape={option.shape} className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider opacity-80 block mb-0.5">
                  Opção {option.letter}
                </span>
                <p className="text-base sm:text-lg font-bold leading-tight">{option.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- REVEAL VIEW ---
  if (roomState.status === 'REVEAL' && currentQ) {
    const maxVotes = Math.max(...roomState.answerDistribution, 1);

    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Visual Progress Bar on Reveal View */}
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={totalQuestions}
          className="mb-2"
        />

        {/* Header with Title */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Pergunta {roomState.currentQuestionIndex + 1} de {totalQuestions} • Resultado
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">{currentQ.title}</h2>
          </div>

          <button
            onClick={() => onShowLeaderboard(roomState.pin)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-md shadow-purple-600/30 whitespace-nowrap"
          >
            Ver Placar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Options Result Grid with Votes Distribution Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQ.options.map((option, idx) => {
            const isCorrect = idx === currentQ.correctOptionIndex;
            const voteCount = roomState.answerDistribution[idx] || 0;
            const barPercentage = Math.round((voteCount / maxVotes) * 100);

            return (
              <div
                key={option.id}
                className={`rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isCorrect
                    ? `${option.bgClass} text-white border-white shadow-xl ring-4 ring-emerald-400/60`
                    : 'bg-white text-slate-800 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 relative z-10 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-black/20 text-white' : `${option.bgClass} text-white`
                      }`}
                    >
                      <ShapeIcon shape={option.shape} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider block">
                        Opção {option.letter}
                      </span>
                      <p className="font-bold text-sm sm:text-base leading-tight">{option.text}</p>
                    </div>
                  </div>

                  {isCorrect && (
                    <div className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-sm shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      CORRETO
                    </div>
                  )}
                </div>

                {/* Vote Bar */}
                <div className="relative z-10 pt-2 border-t border-black/10 flex items-center justify-between text-xs font-bold">
                  <span>{voteCount} respostas</span>
                  <span className="tabular-nums">
                    {roomState.players.length > 0
                      ? `${Math.round((voteCount / roomState.players.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INCA Educational Tip Callout */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-xl shadow-md">
              💡
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-200/60 px-2.5 py-0.5 rounded-md">
                  Fato Comprovado pelo INCA
                </span>
                <span className="text-xs text-slate-500">Educação e Prevenção</span>
              </div>
              <p className="text-base text-purple-950 font-semibold mt-2 leading-relaxed">
                {currentQ.explanation}
              </p>
              {currentQ.incaSourceUrl && (
                <a
                  href={currentQ.incaSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-bold underline mt-2"
                >
                  Consulte a publicação oficial do INCA
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LEADERBOARD VIEW ---
  if (roomState.status === 'LEADERBOARD') {
    const topPlayers = roomState.players.slice(0, 5);
    const maxScore = Math.max(...roomState.players.map((p) => p.score), 1000);

    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* Visual Progress Bar on Leaderboard View */}
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={totalQuestions}
          className="mb-6"
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 bg-purple-100 px-3 py-0.5 rounded-full">
                Placar em Tempo Real
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Rodada {roomState.currentQuestionIndex + 1} de {totalQuestions}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              Classificação dos Participantes
            </h2>
          </div>

          <button
            onClick={() => onNextQuestion(roomState.pin)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-md shadow-purple-600/30 whitespace-nowrap active:scale-95"
          >
            {isLastQuestion ? 'Ver Pódio Final 🏆' : 'Próxima Pergunta'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Players Score List with Framer Motion Layout Reordering */}
        <div className="space-y-3 relative">
          <AnimatePresence mode="popLayout">
            {topPlayers.map((player, idx) => {
              const isFirst = idx === 0;
              const pointsEarned = player.lastAnswer?.pointsEarned || 0;
              const prevScore = Math.max(0, player.score - pointsEarned);

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { type: 'spring', damping: 25, stiffness: 280 },
                    opacity: { duration: 0.35, delay: idx * 0.05 },
                    y: { duration: 0.35, delay: idx * 0.05 },
                  }}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white border-amber-300 shadow-lg ring-2 ring-amber-400/40'
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Subtle growing progress bar underneath showing score ratio */}
                  <motion.div
                    initial={{ width: `${Math.min(100, (prevScore / maxScore) * 100)}%` }}
                    animate={{ width: `${Math.min(100, (player.score / maxScore) * 100)}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className={`absolute bottom-0 left-0 h-1 rounded-full ${
                      isFirst ? 'bg-amber-400' : 'bg-purple-500'
                    }`}
                  />

                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    {/* Left: Position, Avatar, Name & Streaks */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Position Badge */}
                      <motion.div
                        layout
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-transform ${
                          idx === 0
                            ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-800/20 text-amber-900 border border-amber-700/30'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx === 0 ? '🏆' : `#${idx + 1}`}
                      </motion.div>

                      {/* Avatar */}
                      <span className="text-3xl sm:text-4xl shrink-0" role="img" aria-label="avatar">
                        {player.avatar}
                      </span>

                      {/* Name & Details */}
                      <div className="truncate">
                        <div className="flex items-center gap-2 truncate">
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg truncate">
                            {player.nickname}
                          </h3>
                          {idx === 0 && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                              Líder
                            </span>
                          )}
                        </div>

                        {/* Badges row: streak and points gain */}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {player.streak >= 2 && (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="inline-flex items-center gap-1 text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded-full"
                            >
                              <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-orange-500" />
                              {player.streak} acertos seguidos!
                            </motion.span>
                          )}

                          {pointsEarned > 0 ? (
                            <motion.span
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3, duration: 0.4 }}
                              className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                            >
                              +{pointsEarned} pts nesta rodada
                            </motion.span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">0 pts na rodada</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Smoothly Animated Score Counter */}
                    <div className="text-right shrink-0">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight flex items-center justify-end gap-1"
                      >
                        <AnimatedScoreCounter target={player.score} startFrom={prevScore} />
                      </motion.div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block -mt-1">
                        pontos totais
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 'Você sabia?' Educativo durante o Placar */}
        <DidYouKnowBanner
          questionIndex={roomState.currentQuestionIndex}
          className="mt-8"
        />
      </div>
    );
  }

  // --- PODIUM VIEW (Game Complete) ---
  if (roomState.status === 'PODIUM') {
    const first = roomState.players[0];
    const second = roomState.players[1];
    const third = roomState.players[2];

    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        {/* Victory Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Quiz Finalizado com Sucesso!
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Pódio dos Campeões da Prevenção
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-lg mx-auto">
            Parabéns a todos os participantes! O conhecimento é a principal arma contra o câncer.
          </p>
        </div>

        {/* 3D Animated Podium Blocks */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-12 pb-8 max-w-2xl mx-auto">
          {/* 2nd Place */}
          {second && (
            <div className="flex-1 flex flex-col items-center animate-slideUp">
              <span className="text-4xl sm:text-5xl mb-2" role="img" aria-label="avatar">
                {second.avatar}
              </span>
              <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[120px] text-center">
                {second.nickname}
              </p>
              <span className="text-xs font-bold text-slate-500 tabular-nums mb-2">
                {second.score.toLocaleString()} pts
              </span>
              <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-t from-slate-400 to-slate-300 flex flex-col items-center justify-center text-white shadow-lg border-t-4 border-slate-200">
                <span className="text-3xl sm:text-4xl font-black">2</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Prata</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div className="flex-1 flex flex-col items-center -mt-8 animate-slideUp">
              <div className="relative mb-2">
                <span className="text-5xl sm:text-6xl" role="img" aria-label="avatar">
                  {first.avatar}
                </span>
                <Trophy className="w-7 h-7 text-amber-500 fill-amber-400 absolute -top-4 -right-2 drop-shadow-md animate-bounce" />
              </div>
              <p className="font-black text-sm sm:text-base text-slate-900 truncate max-w-[140px] text-center">
                {first.nickname}
              </p>
              <span className="text-xs sm:text-sm font-black text-amber-600 tabular-nums mb-2">
                {first.score.toLocaleString()} pts
              </span>
              <div className="w-full h-48 sm:h-60 rounded-t-2xl bg-gradient-to-t from-amber-500 to-amber-400 flex flex-col items-center justify-center text-amber-950 shadow-2xl border-t-4 border-amber-200">
                <span className="text-4xl sm:text-5xl font-black">1</span>
                <span className="text-[11px] font-black tracking-widest uppercase">Ouro</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex-1 flex flex-col items-center animate-slideUp">
              <span className="text-4xl sm:text-5xl mb-2" role="img" aria-label="avatar">
                {third.avatar}
              </span>
              <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[120px] text-center">
                {third.nickname}
              </p>
              <span className="text-xs font-bold text-slate-500 tabular-nums mb-2">
                {third.score.toLocaleString()} pts
              </span>
              <div className="w-full h-28 sm:h-32 rounded-t-2xl bg-gradient-to-t from-amber-800 to-amber-700 flex flex-col items-center justify-center text-white shadow-lg border-t-4 border-amber-600">
                <span className="text-2xl sm:text-3xl font-black">3</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Bronze</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-4">
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer ring-2 ring-purple-300"
          >
            <BarChart2 className="w-5 h-5 text-purple-200" />
            📊 Resumo da Partida (Maior Índice de Erros)
          </button>

          <button
            onClick={launchCelebrationConfetti}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm uppercase tracking-wider border border-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            🎉 Lançar Mais Confetes!
          </button>
        </div>

        {/* Full Ranking Table & Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Classificação Final de Todos os Jogadores</h3>
              <p className="text-xs text-slate-500">Total de {roomState.players.length} participantes na rodada</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsSummaryOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                Ver Análise de Erros
              </button>
              <button
                onClick={() => onRestart(roomState.pin)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Jogar Novamente
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {roomState.players.map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="font-semibold text-slate-900">{p.nickname}</span>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">{p.score.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Match Summary Modal */}
        <MatchSummaryModal
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          roomState={roomState}
          onLaunchConfetti={launchCelebrationConfetti}
        />
      </div>
    );
  }

  return null;
}
