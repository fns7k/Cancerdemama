import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Tv,
  Smartphone,
  Columns,
  BookOpen,
  Sparkles,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useGameSocket } from './hooks/useGameSocket';
import { HostView } from './components/HostView';
import { PlayerView } from './components/PlayerView';
import { InstructionsView } from './components/InstructionsView';
import { IncaGuidelinesModal } from './components/IncaGuidelinesModal';
import { sounds } from './utils/sound';

type ViewMode = 'HOST' | 'PLAYER' | 'DUAL' | 'INSTRUCTIONS';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('HOST');
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const {
    isConnected,
    roomState,
    playerId,
    playerInfo,
    joinError,
    hostCreateRoom,
    hostStartGame,
    hostAddBots,
    hostNextQuestion,
    hostShowLeaderboard,
    hostRestart,
    playerJoin,
    playerSubmitAnswer,
    playerLeave,
  } = useGameSocket();

  // Create room once connected if no room exists yet
  useEffect(() => {
    if (isConnected && !roomState) {
      hostCreateRoom();
    }
  }, [isConnected, roomState, hostCreateRoom]);

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-purple-200">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-purple-600/30">
            🎗️
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 font-display">
            INCA Kahoot!
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('HOST')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'HOST'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Tela do Projetor
          </button>

          <button
            onClick={() => setCurrentView('PLAYER')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'PLAYER'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Entrar como Jogador
          </button>

          <button
            onClick={() => setCurrentView('DUAL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'DUAL'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Visualize o Projetor e o Celular lado a lado para demonstração instantânea"
          >
            <Columns className="w-3.5 h-3.5" />
            Modo Duplo (Host + Celular)
          </button>

          <button
            onClick={() => setCurrentView('INSTRUCTIONS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'INSTRUCTIONS'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Instruções
          </button>

          <button
            onClick={() => setIsGuidelinesOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Diretrizes do INCA
          </button>
        </nav>

        {/* Zone 3: Primary Action / Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Sons'}
            aria-label={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Sons'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-purple-600" />}
          </button>

          <button
            onClick={() => setIsGuidelinesOpen(true)}
            className="md:hidden p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            title="Diretrizes do INCA"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (roomState?.pin) {
                hostRestart(roomState.pin);
              } else {
                hostCreateRoom();
              }
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Nova Sala
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-b border-slate-200 bg-white px-2 py-1.5">
        <button
          onClick={() => setCurrentView('HOST')}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded-md ${
            currentView === 'HOST' ? 'bg-purple-100 text-purple-800' : 'text-slate-600'
          }`}
        >
          Projetor
        </button>
        <button
          onClick={() => setCurrentView('PLAYER')}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded-md ${
            currentView === 'PLAYER' ? 'bg-purple-100 text-purple-800' : 'text-slate-600'
          }`}
        >
          Jogador
        </button>
        <button
          onClick={() => setCurrentView('DUAL')}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded-md ${
            currentView === 'DUAL' ? 'bg-purple-100 text-purple-800' : 'text-slate-600'
          }`}
        >
          Duplo
        </button>
        <button
          onClick={() => setCurrentView('INSTRUCTIONS')}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded-md ${
            currentView === 'INSTRUCTIONS' ? 'bg-purple-100 text-purple-800' : 'text-slate-600'
          }`}
        >
          Instruções
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center">
        {currentView === 'HOST' && (
          <HostView
            roomState={roomState}
            onStartGame={hostStartGame}
            onAddBots={hostAddBots}
            onNextQuestion={hostNextQuestion}
            onShowLeaderboard={hostShowLeaderboard}
            onRestart={hostRestart}
            onOpenGuidelines={() => setIsGuidelinesOpen(true)}
          />
        )}

        {currentView === 'PLAYER' && (
          <PlayerView
            roomState={roomState}
            playerId={playerId}
            playerInfo={playerInfo}
            joinError={joinError}
            onJoin={playerJoin}
            onSubmitAnswer={playerSubmitAnswer}
            onLeave={playerLeave}
            defaultPin={roomState?.pin}
          />
        )}

        {currentView === 'DUAL' && (
          <div className="w-full max-w-[1500px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Host Screen */}
            <div className="lg:col-span-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200 p-2 sm:p-4 shadow-sm">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-purple-600" />
                  Tela do Projetor (Visão do Anfitrião)
                </span>
                {roomState && <span className="tabular-nums">PIN: {roomState.pin}</span>}
              </div>
              <HostView
                roomState={roomState}
                onStartGame={hostStartGame}
                onAddBots={hostAddBots}
                onNextQuestion={hostNextQuestion}
                onShowLeaderboard={hostShowLeaderboard}
                onRestart={hostRestart}
                onOpenGuidelines={() => setIsGuidelinesOpen(true)}
              />
            </div>

            {/* Right: Mobile Phone Simulator */}
            <div className="lg:col-span-4 sticky top-20">
              <div className="px-4 py-2 bg-slate-900 text-white rounded-t-3xl text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  Simulador de Celular (Jogador)
                </span>
                <span className="text-[10px] text-slate-400">Tempo Real</span>
              </div>
              <div className="bg-slate-200 p-3 rounded-b-3xl border-x border-b border-slate-300 shadow-xl">
                <div className="bg-slate-50 rounded-2xl min-h-[580px] p-2 flex flex-col justify-center border border-slate-300 shadow-inner">
                  <PlayerView
                    roomState={roomState}
                    playerId={playerId}
                    playerInfo={playerInfo}
                    joinError={joinError}
                    onJoin={playerJoin}
                    onSubmitAnswer={playerSubmitAnswer}
                    onLeave={playerLeave}
                    defaultPin={roomState?.pin}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'INSTRUCTIONS' && (
          <InstructionsView
            onNavigateToHost={() => setCurrentView('HOST')}
            onNavigateToPlayer={() => setCurrentView('PLAYER')}
            onNavigateToDual={() => setCurrentView('DUAL')}
            onOpenGuidelines={() => setIsGuidelinesOpen(true)}
          />
        )}
      </main>

      {/* Educational Guidelines Modal */}
      <IncaGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </div>
  );
}
