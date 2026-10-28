import { INCA_QUESTIONS } from '../data/questions';
import { ClientMessage, Player, QuestionStat, RoomState, ServerMessage } from '../types/quiz';

function createInitialQuestionStats(): QuestionStat[] {
  return INCA_QUESTIONS.map((_, idx) => ({
    questionIndex: idx,
    totalAnswers: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    answerDistribution: [0, 0, 0, 0],
  }));
}

interface LocalInternalRoom {
  pin: string;
  status: RoomState['status'];
  currentQuestionIndex: number;
  timeRemaining: number;
  totalTime: number;
  players: Map<string, Player>;
  answerCount: number;
  answerDistribution: [number, number, number, number];
  questionStats: QuestionStat[];
  questionStartTime: number;
  questionTimer: any;
  countdownTimer: any;
  botTimeouts: any[];
}

const BOT_PRESETS = [
  { nickname: 'Dra. Prevenção', avatar: '🩺' },
  { nickname: 'Nutri Júlia', avatar: '🥗' },
  { nickname: 'Carlos Atleta', avatar: '🏃' },
  { nickname: 'Enfermeira Bia', avatar: '🎗️' },
  { nickname: 'Dr. Lucas', avatar: '🔬' },
  { nickname: 'Prof. Marcos', avatar: '🍎' },
];

export class LocalGameEngine {
  private room: LocalInternalRoom | null = null;
  private listeners: Set<(msg: ServerMessage) => void> = new Set();
  private channel: BroadcastChannel | null = null;
  private isLeader = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('inca_kahoot_cross_tab_bus');
        this.channel.onmessage = (event) => {
          this.handleCrossTabEvent(event.data);
        };
        // Request existing room sync from other active tabs
        setTimeout(() => {
          if (this.channel) {
            this.channel.postMessage({ kind: 'REQUEST_ROOM_SYNC' });
          }
        }, 150);
      } catch (err) {
        console.warn('BroadcastChannel not supported or blocked:', err);
      }
    }
  }

  public subscribe(listener: (msg: ServerMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(msg: ServerMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Error in listener:', e);
      }
    });

    // Also forward to other browser tabs
    if (this.channel) {
      try {
        this.channel.postMessage({ kind: 'SERVER_MSG', payload: msg });
      } catch (e) {
        // ignore
      }
    }
  }

  private handleCrossTabEvent(data: any) {
    if (!data) return;

    if (data.kind === 'REQUEST_ROOM_SYNC' && this.isLeader && this.room) {
      this.broadcastState();
    } else if (data.kind === 'CLIENT_MSG' && this.isLeader && this.room) {
      // Leader processes incoming client actions from other tabs
      this.processClientMessage(data.payload);
    } else if (data.kind === 'SERVER_MSG') {
      // Non-leader or peer tab updates its local view
      this.listeners.forEach((listener) => listener(data.payload));
    }
  }

  public handleClientMessage(msg: ClientMessage) {
    // If we have a channel and this tab is not the leader/host, forward to host tab
    if (!this.room && this.channel) {
      try {
        this.channel.postMessage({ kind: 'CLIENT_MSG', payload: msg });
      } catch (e) {
        // continue locally
      }
    }

    this.processClientMessage(msg);
  }

  private processClientMessage(msg: ClientMessage) {
    switch (msg.type) {
      case 'HOST_CREATE_ROOM': {
        this.createRoom();
        break;
      }

      case 'HOST_START_GAME': {
        if (!this.room || this.room.pin !== msg.pin) return;
        this.startCountdown();
        break;
      }

      case 'HOST_ADD_BOTS': {
        if (!this.room || this.room.pin !== msg.pin) return;
        this.addBots(msg.count);
        break;
      }

      case 'HOST_NEXT_QUESTION': {
        if (!this.room || this.room.pin !== msg.pin) return;
        this.nextQuestion();
        break;
      }

      case 'HOST_SHOW_LEADERBOARD': {
        if (!this.room || this.room.pin !== msg.pin) return;
        this.showLeaderboard();
        break;
      }

      case 'HOST_RESTART': {
        if (!this.room || this.room.pin !== msg.pin) return;
        this.restartRoom();
        break;
      }

      case 'PLAYER_JOIN': {
        this.handlePlayerJoin(msg.pin, msg.nickname, msg.avatar);
        break;
      }

      case 'PLAYER_SUBMIT_ANSWER': {
        if (!this.room || this.room.pin !== msg.pin) return;
        this.submitPlayerAnswer(msg.playerId, msg.optionIndex);
        break;
      }

      case 'PLAYER_LEAVE': {
        if (!this.room || this.room.pin !== msg.pin) return;
        const p = this.room.players.get(msg.playerId);
        if (p) {
          p.isConnected = false;
          this.broadcastState();
        }
        break;
      }
    }
  }

  private createRoom() {
    this.clearTimers();
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    this.isLeader = true;

    this.room = {
      pin,
      status: 'LOBBY',
      currentQuestionIndex: 0,
      timeRemaining: 20,
      totalTime: 20,
      players: new Map(),
      answerCount: 0,
      answerDistribution: [0, 0, 0, 0],
      questionStats: createInitialQuestionStats(),
      questionStartTime: Date.now(),
      questionTimer: null,
      countdownTimer: null,
      botTimeouts: [],
    };

    this.emit({ type: 'ROOM_CREATED', pin });
    this.broadcastState();
  }

  private getPublicRoomState(): RoomState {
    if (!this.room) {
      throw new Error('Room does not exist');
    }

    const playersList: Player[] = Array.from(this.room.players.values()).map((p) => ({
      ...p,
      lastAnswer: p.lastAnswer ? { ...p.lastAnswer } : undefined,
    }));

    playersList.sort((a, b) => b.score - a.score);

    return {
      pin: this.room.pin,
      status: this.room.status,
      currentQuestionIndex: this.room.currentQuestionIndex,
      totalQuestions: INCA_QUESTIONS.length,
      timeRemaining: this.room.timeRemaining,
      totalTime: this.room.totalTime,
      players: playersList,
      answerCount: this.room.answerCount,
      answerDistribution: [...this.room.answerDistribution] as [number, number, number, number],
      questionStats: this.room.questionStats.map((s) => ({
        ...s,
        answerDistribution: [...s.answerDistribution] as [number, number, number, number],
      })),
    };
  }

  private broadcastState() {
    if (!this.room) return;
    const state = this.getPublicRoomState();
    this.emit({ type: 'ROOM_STATE_SYNC', state });
  }

  private clearTimers() {
    if (!this.room) return;
    if (this.room.questionTimer) {
      clearInterval(this.room.questionTimer);
      this.room.questionTimer = null;
    }
    if (this.room.countdownTimer) {
      clearInterval(this.room.countdownTimer);
      this.room.countdownTimer = null;
    }
    this.room.botTimeouts.forEach((t) => clearTimeout(t));
    this.room.botTimeouts = [];
  }

  private startCountdown() {
    if (!this.room) return;
    this.clearTimers();
    this.room.status = 'COUNTDOWN';
    this.room.timeRemaining = 3;
    this.broadcastState();

    this.room.countdownTimer = setInterval(() => {
      if (!this.room) return;
      this.room.timeRemaining -= 1;
      if (this.room.timeRemaining <= 0) {
        if (this.room.countdownTimer) clearInterval(this.room.countdownTimer);
        this.room.countdownTimer = null;
        this.startQuestion(this.room.currentQuestionIndex);
      } else {
        this.broadcastState();
      }
    }, 1000);
  }

  private startQuestion(questionIndex: number) {
    if (!this.room) return;
    this.clearTimers();

    const question = INCA_QUESTIONS[questionIndex];
    if (!question) {
      this.room.status = 'PODIUM';
      this.broadcastState();
      return;
    }

    this.room.status = 'QUESTION';
    this.room.currentQuestionIndex = questionIndex;
    this.room.totalTime = question.timeLimitSeconds;
    this.room.timeRemaining = question.timeLimitSeconds;
    this.room.answerCount = 0;
    this.room.answerDistribution = [0, 0, 0, 0];
    this.room.questionStartTime = Date.now();

    for (const player of this.room.players.values()) {
      player.lastAnswer = undefined;
    }

    this.broadcastState();
    this.scheduleBotAnswers(questionIndex);

    this.room.questionTimer = setInterval(() => {
      if (!this.room) return;
      this.room.timeRemaining -= 1;

      if (this.room.timeRemaining <= 0) {
        this.revealAnswers();
      } else {
        this.emit({ type: 'QUESTION_TICK', timeRemaining: this.room.timeRemaining });
        if (this.room.timeRemaining % 5 === 0) {
          this.broadcastState();
        }
      }
    }, 1000);
  }

  private scheduleBotAnswers(questionIndex: number) {
    if (!this.room) return;
    const currentQ = INCA_QUESTIONS[questionIndex];
    if (!currentQ) return;

    const bots = Array.from(this.room.players.values()).filter((p) => p.isBot);

    bots.forEach((bot) => {
      const delaySeconds = Math.min(
        currentQ.timeLimitSeconds - 1,
        Math.max(2, Math.floor(Math.random() * (currentQ.timeLimitSeconds - 3)) + 2)
      );

      const timeout = setTimeout(() => {
        if (!this.room || this.room.status !== 'QUESTION' || this.room.currentQuestionIndex !== questionIndex) {
          return;
        }

        const isCorrect = Math.random() < 0.8;
        let optionIndex = currentQ.correctOptionIndex;
        if (!isCorrect) {
          const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctOptionIndex);
          optionIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        }

        this.submitPlayerAnswer(bot.id, optionIndex);
      }, delaySeconds * 1000);

      if (this.room) {
        this.room.botTimeouts.push(timeout);
      }
    });
  }

  private submitPlayerAnswer(playerId: string, optionIndex: number) {
    if (!this.room || this.room.status !== 'QUESTION') return;

    const player = this.room.players.get(playerId);
    if (!player || player.lastAnswer) return;

    const currentQ = INCA_QUESTIONS[this.room.currentQuestionIndex];
    if (!currentQ) return;

    const timeTakenSeconds = Math.max(0.5, (Date.now() - this.room.questionStartTime) / 1000);
    const isCorrect = optionIndex === currentQ.correctOptionIndex;

    let pointsEarned = 0;
    if (isCorrect) {
      const fraction = timeTakenSeconds / currentQ.timeLimitSeconds;
      const basePoints = Math.round(1000 * (1 - fraction / 2));
      const streakBonus = Math.min((player.streak || 0) * 50, 250);
      pointsEarned = Math.max(500, basePoints) + streakBonus;
      player.streak = (player.streak || 0) + 1;
    } else {
      player.streak = 0;
    }

    player.score += pointsEarned;
    player.lastAnswer = {
      optionIndex,
      timeTakenSeconds: Number(timeTakenSeconds.toFixed(1)),
      isCorrect,
      pointsEarned,
    };

    this.room.answerCount += 1;
    if (optionIndex >= 0 && optionIndex <= 3) {
      this.room.answerDistribution[optionIndex] += 1;
    }

    const currentQStat = this.room.questionStats[this.room.currentQuestionIndex];
    if (currentQStat) {
      currentQStat.totalAnswers += 1;
      if (isCorrect) {
        currentQStat.correctAnswers += 1;
      } else {
        currentQStat.wrongAnswers += 1;
      }
      if (optionIndex >= 0 && optionIndex <= 3) {
        currentQStat.answerDistribution[optionIndex] += 1;
      }
    }

    this.broadcastState();

    const activePlayers = Array.from(this.room.players.values()).filter(
      (p) => p.isBot || p.isConnected
    );
    if (activePlayers.length > 0 && this.room.answerCount >= activePlayers.length) {
      this.revealAnswers();
    }
  }

  private revealAnswers() {
    if (!this.room) return;
    this.clearTimers();
    this.room.status = 'REVEAL';
    this.room.timeRemaining = 0;
    this.broadcastState();
  }

  private showLeaderboard() {
    if (!this.room) return;
    this.clearTimers();
    this.room.status = 'LEADERBOARD';
    this.broadcastState();
  }

  private nextQuestion() {
    if (!this.room) return;
    this.clearTimers();
    const nextIdx = this.room.currentQuestionIndex + 1;
    if (nextIdx >= INCA_QUESTIONS.length) {
      this.room.status = 'PODIUM';
      this.broadcastState();
    } else {
      this.startCountdown();
    }
  }

  private addBots(count = 3) {
    if (!this.room) return;

    for (let i = 0; i < count; i++) {
      const preset = BOT_PRESETS[(this.room.players.size + i) % BOT_PRESETS.length];
      const botId = `bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const botPlayer: Player = {
        id: botId,
        nickname: `${preset.nickname}`,
        avatar: preset.avatar,
        score: 0,
        streak: 0,
        isConnected: true,
        isBot: true,
      };
      this.room.players.set(botId, botPlayer);
    }

    this.broadcastState();
  }

  private handlePlayerJoin(pin: string, nickname: string, avatar: string) {
    if (!this.room || this.room.pin !== pin) {
      this.emit({
        type: 'PLAYER_JOIN_ERROR',
        message: 'Sala não encontrada. Verifique o Game PIN digitado!',
      });
      return;
    }

    const playerId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newPlayer: Player = {
      id: playerId,
      nickname,
      avatar,
      score: 0,
      streak: 0,
      isConnected: true,
      isBot: false,
    };

    this.room.players.set(playerId, newPlayer);

    const publicState = this.getPublicRoomState();
    this.emit({
      type: 'PLAYER_JOIN_SUCCESS',
      playerId,
      player: newPlayer,
      roomState: publicState,
    });

    this.broadcastState();
  }

  private restartRoom() {
    if (!this.room) return;
    this.clearTimers();

    this.room.status = 'LOBBY';
    this.room.currentQuestionIndex = 0;
    this.room.timeRemaining = 20;
    this.room.answerCount = 0;
    this.room.answerDistribution = [0, 0, 0, 0];
    this.room.questionStats = createInitialQuestionStats();

    for (const player of this.room.players.values()) {
      player.score = 0;
      player.streak = 0;
      player.lastAnswer = undefined;
    }

    this.broadcastState();
  }
}

// Singleton local engine
export const localGameEngine = new LocalGameEngine();
