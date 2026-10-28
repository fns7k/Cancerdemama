import React from 'react';
import {
  Tv,
  Smartphone,
  Columns,
  Trophy,
  Flame,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Users,
  Timer,
  Award,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ShapeIcon } from './KahootIcons';

interface Props {
  onNavigateToHost: () => void;
  onNavigateToPlayer: () => void;
  onNavigateToDual: () => void;
  onOpenGuidelines: () => void;
}

export function InstructionsView({
  onNavigateToHost,
  onNavigateToPlayer,
  onNavigateToDual,
  onOpenGuidelines,
}: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3 border border-purple-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            Guia Completo de Instruções
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Como Jogar o INCA Kahoot!
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium mt-2 leading-relaxed">
            Aprenda a liderar o quiz no projetor, conectar participantes pelos celulares e aproveitar todos os recursos educativos sobre prevenção do câncer.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onNavigateToHost}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/30 flex items-center gap-2"
            >
              <Tv className="w-4 h-4" />
              Abrir Projetor
            </button>
            <button
              onClick={onNavigateToPlayer}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Entrar como Jogador
            </button>
            <button
              onClick={onNavigateToDual}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Columns className="w-4 h-4" />
              Modo Duplo (Simulação)
            </button>
          </div>
        </div>
      </div>

      {/* 3 Steps: Host, Player, Game Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: O Anfitrião */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
              <Tv className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
              Passo 1
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5 mb-2">
              Tela do Projetor (Para o Apresentador)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Esta tela foi projetada para ser transmitida em uma TV, projetor de auditório ou reunião virtual (Zoom, Meet, Teams).
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Game PIN de 6 dígitos:</strong> O código da sala fica destacado no topo para todos entrarem.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>+3 Jogadores Virtuais:</strong> Adiciona participantes simulados para demonstrar ou testar o quiz mesmo sozinho.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Gabarito e Fato INCA:</strong> Ao fim de cada pergunta, mostra o percentual de votos da sala e a explicação científica oficial.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Placar com Reordenação Fluida:</strong> Animação suave que reposiciona os líderes em tempo real.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={onNavigateToHost}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Ir para a Tela do Projetor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 2: O Jogador */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
              Passo 2
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5 mb-2">
              Entrar como Jogador (No Celular)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Cada aluno, colaborador ou participante acessa o site pelo seu próprio smartphone ou navegador.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>PIN & Apelido:</strong> Digite o PIN da tela, seu nome e escolha um avatar temático (🎗️, 🍎, 🥦, 🏃, 🩺, etc.).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Dica de Saúde do INCA:</strong> Enquanto aguarda a partida começar, você aprende fatos curtos sobre prevenção.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>4 Botões Gigantes:</strong> Olhe a pergunta na tela principal e toque no formato/cor correspondente no seu aparelho.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Botão Pulsante:</strong> Após o tempo expirar, o botão correto pulsa com anel esmeralda para você conferir na hora.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={onNavigateToPlayer}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Ir para a Tela do Jogador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Shapes & Colors Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-slate-900 text-lg mb-2">
          As 4 Cores e Formas Oficiais do Kahoot!
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Cada pergunta de múltipla escolha possui 4 alternativas visualmente padronizadas:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#E21B3C] text-white flex flex-col items-center justify-center shadow-sm">
            <ShapeIcon shape="triangle" className="w-8 h-8 mb-1.5" />
            <span className="text-xs font-black uppercase tracking-wider">Opção A</span>
            <span className="text-[11px] opacity-90">Triângulo Vermelho</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1368CE] text-white flex flex-col items-center justify-center shadow-sm">
            <ShapeIcon shape="diamond" className="w-8 h-8 mb-1.5" />
            <span className="text-xs font-black uppercase tracking-wider">Opção B</span>
            <span className="text-[11px] opacity-90">Losango Azul</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#D89E00] text-white flex flex-col items-center justify-center shadow-sm">
            <ShapeIcon shape="circle" className="w-8 h-8 mb-1.5" />
            <span className="text-xs font-black uppercase tracking-wider">Opção C</span>
            <span className="text-[11px] opacity-90">Círculo Amarelo</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#26890C] text-white flex flex-col items-center justify-center shadow-sm">
            <ShapeIcon shape="square" className="w-8 h-8 mb-1.5" />
            <span className="text-xs font-black uppercase tracking-wider">Opção D</span>
            <span className="text-[11px] opacity-90">Quadrado Verde</span>
          </div>
        </div>
      </div>

      {/* Scoring and Educational System */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
            <Timer className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm mb-1">Velocidade Conta Pontos</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Respostas corretas rendem até 1.000 pontos. Quanto mais rápido o participante responder dentro dos 20 segundos, maior a pontuação obtida.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm mb-1">Sequências de Acertos 🔥</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Acertar 2 ou mais perguntas consecutivas ativa multiplicadores de sequência (*streaks*), impulsionando a subida no placar.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm mb-1">Resumo Pedagógico</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ao fim da partida, o sistema analisa automaticamente qual questão teve mais erros e reforça a explicação científica do INCA para fechar com chave de ouro.
          </p>
        </div>
      </div>

      {/* Deployment & Vercel Compatibility Note */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
            ⚡
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              Compatibilidade Total com Vercel, Servidores e Modo Offline
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              O sistema possui um motor híbrido inteligente: se hospedado na Vercel (onde servidores WebSocket contínuos não rodam), o jogo ativa automaticamente o modo direto com sincronização entre abas via <strong>BroadcastChannel</strong> e suporte a jogadores virtuais, sem nunca travar ou carregar infinitamente.
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines Button banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 gap-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-purple-600 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Quer consultar a base teórica completa?</span>
            <span className="text-purple-700">Veja os relatórios e publicações em PDF do Instituto Nacional de Câncer.</span>
          </div>
        </div>
        <button
          onClick={onOpenGuidelines}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shrink-0 shadow-sm"
        >
          Ver Diretrizes do INCA
        </button>
      </div>
    </div>
  );
}
