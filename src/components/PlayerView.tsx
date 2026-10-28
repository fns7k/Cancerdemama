import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Flame,
  Trophy,
  Sparkles,
  ArrowRight,
  LogOut,
  Send,
  Check,
} from 'lucide-react';
import { Player, RoomState } from '../types/quiz';
import { INCA_QUESTIONS } from '../data/questions';
import { ShapeIcon } from './KahootIcons';
import { sounds } from '../utils/sound';
import { IncaTipCard } from './IncaTipCard';
import { QuizProgressBar } from './QuizProgressBar';
import { DidYouKnowBanner } from './DidYouKnowBanner';

interface Props {
  roomState: RoomState | null;
  playerId: string | null;
  playerInfo: Player | null;
  joinError: string | null;
  onJoin: (pin: string, nickname: string, avatar: string) => void;
  onSubmitAnswer: (pin: string, playerId: string, optionIndex: number) => void;
  onLeave: (pin: string, playerId: string) => void;
  defaultPin?: string;
}

const AVATAR_OPTIONS = ['🎗️', '🍎', '🥦', '🏃', '🩺', '☀️', '💧', '🥗', '🚴', '🏊'];

export function PlayerView({
  roomState,
  playerId,
  playerInfo,
  joinError,
  onJoin,
  onSubmitAnswer,
  onLeave,
  defaultPin = '',
}: Props) {
  const [pin, setPin] = useState(defaultPin || (roomState?.pin ?? ''));
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // Keep pin synced if defaultPin or roomState.pin changes and user hasn't typed
  React.useEffect(() => {
    if (defaultPin) setPin(defaultPin);
    else if (roomState?.pin && !pin) setPin(roomState.pin);
  }, [defaultPin, roomState?.pin]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;
    sounds.playClick();
    onJoin(pin.replace(/\s+/g, ''), nickname.trim(), selectedAvatar);
  };

  const handleOptionClick = (optionIndex: number) => {
    if (!roomState || !playerId || playerInfo?.lastAnswer) return;
    sounds.playClick();
    onSubmitAnswer(roomState.pin, playerId, optionIndex);
  };

  // 1. JOIN SCREEN
  if (!playerId || !playerInfo) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg shadow-purple-600/30 mb-3">
              🎗️
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Entrar no Quiz INCA</h2>
            <p className="text-xs text-slate-500 mt-1">
              Digite o Game PIN exibido na tela principal para jogar
            </p>
          </div>

          {joinError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Game PIN:
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ex: 482910"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-center text-xl font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Seu Apelido / Nome:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Como quer ser chamado?"
                maxLength={18}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Escolha seu Avatar:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-purple-100 border-2 border-purple-600 scale-105 shadow-sm'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 mt-2"
            >
              <span>Entrar no Jogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If in room but roomState is not ready
  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-bold text-slate-800">Conectando à partida...</p>
      </div>
    );
  }

  const currentQ = INCA_QUESTIONS[roomState.currentQuestionIndex];
  const hasAnswered = !!playerInfo.lastAnswer;
  const myRank =
    roomState.players.findIndex((p) => p.id === playerInfo.id) >= 0
      ? roomState.players.findIndex((p) => p.id === playerInfo.id) + 1
      : 1;

  // 2. LOBBY WAITING SCREEN
  if (roomState.status === 'LOBBY') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="w-20 h-20 rounded-full bg-purple-50 border-2 border-purple-200 text-4xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            {playerInfo.avatar}
          </div>

          <h2 className="text-2xl font-black text-slate-900">{playerInfo.nickname}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Você está conectado!
          </div>

          <p className="text-sm text-slate-600 font-medium mt-4">
            Olhe para a tela do projetor / host. O anfitrião iniciará o quiz em instantes!
          </p>

          {/* Dica do Dia do INCA */}
          <div className="mt-5">
            <IncaTipCard />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>PIN: {roomState.pin}</span>
            <button
              onClick={() => onLeave(roomState.pin, playerInfo.id)}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. COUNTDOWN SCREEN
  if (roomState.status === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-sm mx-auto">
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={10}
          variant="player"
          className="mb-6"
        />

        <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
          Atenção à tela principal!
        </span>
        <div className="w-28 h-28 rounded-full bg-purple-600 text-white font-black text-5xl flex items-center justify-center my-6 shadow-xl shadow-purple-600/30 animate-pulse">
          {roomState.timeRemaining}
        </div>
        <p className="text-sm font-semibold text-slate-700">A pergunta começará em instantes!</p>
      </div>
    );
  }

  // 4. QUESTION SCREEN — Iconic 4 Shapes
  if (roomState.status === 'QUESTION' && currentQ) {
    if (hasAnswered) {
      return (
        <div className="w-full max-w-md mx-auto px-4 py-6 text-center animate-fadeIn space-y-4">
          <QuizProgressBar
            currentQuestionIndex={roomState.currentQuestionIndex}
            totalQuestions={10}
            variant="player"
            className="mb-2"
          />

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 animate-spinSlow">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Resposta Registrada!</h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Aguardando o tempo se esgotar ou os demais participantes responderem...
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Pergunta {roomState.currentQuestionIndex + 1} de {INCA_QUESTIONS.length}</span>
              <span className="text-purple-600">Boa sorte! 🤞</span>
            </div>

            {/* Dica do Dia while waiting */}
            <div className="mt-4">
              <IncaTipCard />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 flex flex-col justify-between min-h-[75vh]">
        {/* Visual Progress Bar on Question View */}
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={10}
          variant="player"
          className="mb-3"
        />

        {/* Top Info Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{playerInfo.avatar}</span>
            <span className="text-xs font-bold text-slate-800">{playerInfo.nickname}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
              Q{roomState.currentQuestionIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              ⏱️ {roomState.timeRemaining}s
            </span>
          </div>
        </div>

        {/* 4 Big Kahoot Tap Targets */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 my-2">
          {currentQ.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              className={`${opt.bgClass} ${opt.hoverClass} ${opt.activeClass} text-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer min-h-[140px] sm:min-h-[180px] focus:outline-none`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/15 flex items-center justify-center mb-2">
                <ShapeIcon shape={opt.shape} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider opacity-90">
                {opt.letter}
              </span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-center text-slate-400 mt-2">
          Toque no símbolo correspondente à sua resposta na tela do projetor
        </p>
      </div>
    );
  }

  // 5. REVEAL SCREEN
  if (roomState.status === 'REVEAL' && currentQ) {
    const lastAns = playerInfo.lastAnswer;
    const isCorrect = lastAns?.isCorrect;
    const chosenOptionIndex = lastAns?.optionIndex;

    return (
      <div className="w-full max-w-md mx-auto px-4 py-4 text-center animate-fadeIn space-y-4">
        {/* Progress Bar */}
        <QuizProgressBar
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={10}
          variant="player"
          className="mb-2"
        />

        {/* Result Summary Pill */}
        <div
          className={`rounded-3xl p-5 sm:p-6 shadow-xl text-white transition-all ${
            isCorrect
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
              : 'bg-gradient-to-r from-rose-600 to-rose-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
                {isCorrect ? <CheckCircle2 className="w-7 h-7 text-white" /> : <XCircle className="w-7 h-7 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-black leading-tight">{isCorrect ? 'Você acertou!' : 'Você errou!'}</h2>
                <span className="text-xs text-white/90 font-medium">
                  {isCorrect ? `+${lastAns?.pointsEarned || 0} pts ganhos` : 'Veja a resposta correta abaixo'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xl font-black tabular-nums">{playerInfo.score.toLocaleString()}</span>
              <span className="text-[10px] uppercase font-bold block opacity-80 -mt-1">pts totais</span>
            </div>
          </div>

          {playerInfo.streak >= 2 && isCorrect && (
            <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-center gap-1.5 text-xs font-bold text-orange-200">
              <Flame className="w-4 h-4 fill-current animate-pulse text-amber-300" />
              {playerInfo.streak} acertos em sequência! 🔥
            </div>
          )}
        </div>

        {/* 4 Answers Grid with Animated Pulsing on the Correct One */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Gabarito da Pergunta {roomState.currentQuestionIndex + 1}:
            </span>
            <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Opção correta destacada
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {currentQ.options.map((opt) => {
              const isThisCorrect = opt.id === currentQ.correctOptionIndex;
              const isChosenByUser = chosenOptionIndex === opt.id;
              const isChosenWrong = isChosenByUser && !isThisCorrect;

              return (
                <motion.div
                  key={opt.id}
                  animate={
                    isThisCorrect
                      ? {
                          scale: [1, 1.04, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(16, 185, 129, 0.7)',
                            '0 0 0 12px rgba(16, 185, 129, 0)',
                            '0 0 0 0 rgba(16, 185, 129, 0)',
                          ],
                        }
                      : { scale: 0.96 }
                  }
                  transition={
                    isThisCorrect
                      ? {
                          duration: 1.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : { duration: 0.2 }
                  }
                  className={`relative rounded-2xl p-4 flex flex-col items-center justify-center text-white transition-all min-h-[120px] ${
                    isThisCorrect
                      ? `${opt.bgClass} ring-4 ring-emerald-400 ring-offset-2 shadow-xl opacity-100 z-10 font-bold`
                      : isChosenWrong
                      ? 'bg-rose-900/70 border-2 border-rose-500/80 opacity-50 grayscale-[20%]'
                      : 'bg-slate-700/50 opacity-30 grayscale-[60%] border border-transparent'
                  }`}
                >
                  {/* Correct Answer Pulsing Top Badge */}
                  {isThisCorrect && (
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md border border-white"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      Correta
                    </motion.div>
                  )}

                  {/* Chosen by user tag if incorrect */}
                  {isChosenWrong && (
                    <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm border border-white/40">
                      <XCircle className="w-3 h-3" />
                      Sua escolha
                    </div>
                  )}

                  {/* Chosen by user tag if correct */}
                  {isThisCorrect && isChosenByUser && (
                    <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-black uppercase tracking-wider shadow-sm border border-emerald-300">
                      🎯 Você marcou esta!
                    </div>
                  )}

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                      isThisCorrect ? 'bg-black/25 text-white' : 'bg-black/15 text-white/80'
                    }`}
                  >
                    <ShapeIcon shape={opt.shape} className="w-6 h-6" />
                  </div>

                  <span className="text-xs font-black uppercase tracking-wider opacity-90">
                    Opção {opt.letter}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-slate-500 font-medium mt-3">
            💡 Olhe para o projetor para conferir a explicação científica do INCA!
          </p>
        </div>
      </div>
    );
  }

  // 6. LEADERBOARD / PODIUM SCREEN (For Player)
  if (roomState.status === 'LEADERBOARD' || roomState.status === 'PODIUM') {
    const isPodium = roomState.status === 'PODIUM';

    return (
      <div className="w-full max-w-md mx-auto px-4 py-6 text-center animate-fadeIn space-y-4">
        {/* Progress Bar (not on final podium) */}
        {!isPodium && (
          <QuizProgressBar
            currentQuestionIndex={roomState.currentQuestionIndex}
            totalQuestions={10}
            variant="player"
            className="mb-2"
          />
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto mb-4 text-4xl">
            {isPodium ? '🏆' : playerInfo.avatar}
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600">
            {isPodium ? 'Resultado Final' : 'Classificação'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Você está em #{myRank}º Lugar!
          </h2>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Pontos</span>
              <span className="text-2xl font-black text-purple-700 tabular-nums">
                {playerInfo.score.toLocaleString()}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Sequência</span>
              <span className="text-2xl font-black text-orange-600 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-current" />
                {playerInfo.streak}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {isPodium
              ? 'Obrigado por participar! O conhecimento sobre a prevenção salva vidas.'
              : 'Aguarde o anfitrião passar para a próxima pergunta...'}
          </p>
        </div>

        {/* Você Sabia? Banner between rounds */}
        {!isPodium && (
          <DidYouKnowBanner
            questionIndex={roomState.currentQuestionIndex}
            className="text-left"
          />
        )}
      </div>
    );
  }

  return null;
}
