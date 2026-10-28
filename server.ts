process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true';

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import { INCA_QUESTIONS } from './src/data/questions.ts';
import { ClientMessage, Player, QuestionStat, RoomState, ServerMessage } from './src/types/quiz.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

function createInitialQuestionStats(): QuestionStat[] {
  return INCA_QUESTIONS.map((_, idx) => ({
    questionIndex: idx,
    totalAnswers: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    answerDistribution: [0, 0, 0, 0],
  }));
}

interface InternalRoom {
  pin: string;
  hostWs: WebSocket | null;
  status: RoomState['status'];
  currentQuestionIndex: number;
  timeRemaining: number;
  totalTime: number;
  players: Map<string, Player & { ws?: WebSocket }>;
  answerCount: number;
  answerDistribution: [number, number, number, number];
  questionStats: QuestionStat[];
  questionStartTime: number;
  questionTimer: NodeJS.Timeout | null;
  countdownTimer: NodeJS.Timeout | null;
  botTimeouts: NodeJS.Timeout[];
}

const rooms = new Map<string, InternalRoom>();

function generatePin(): string {
  let pin = '';
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(pin));
  return pin;
}

function getPublicRoomState(room: InternalRoom): RoomState {
  const playersList: Player[] = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    nickname: p.nickname,
    avatar: p.avatar,
    score: p.score,
    streak: p.streak,
    lastAnswer: p.lastAnswer,
    isConnected: p.isConnected,
    isBot: p.isBot,
  }));

  // Sort by score descending for leaderboard display
  playersList.sort((a, b) => b.score - a.score);

  return {
    pin: room.pin,
    status: room.status,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: INCA_QUESTIONS.length,
    timeRemaining: room.timeRemaining,
    totalTime: room.totalTime,
    players: playersList,
    answerCount: room.answerCount,
    answerDistribution: [...room.answerDistribution] as [number, number, number, number],
    questionStats: room.questionStats.map((s) => ({
      ...s,
      answerDistribution: [...s.answerDistribution] as [number, number, number, number],
    })),
  };
}

function broadcastToRoom(room: InternalRoom, message: ServerMessage) {
  const payload = JSON.stringify(message);

  // Send to host
  if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
    room.hostWs.send(payload);
  }

  // Send to all players
  for (const player of room.players.values()) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(payload);
    }
  }
}

function broadcastState(room: InternalRoom) {
  const state = getPublicRoomState(room);
  broadcastToRoom(room, { type: 'ROOM_STATE_SYNC', state });
}

function startCountdown(room: InternalRoom) {
  clearTimers(room);
  room.status = 'COUNTDOWN';
  room.timeRemaining = 3;
  broadcastState(room);

  room.countdownTimer = setInterval(() => {
    room.timeRemaining -= 1;
    if (room.timeRemaining <= 0) {
      if (room.countdownTimer) clearInterval(room.countdownTimer);
      room.countdownTimer = null;
      startQuestion(room, room.currentQuestionIndex);
    } else {
      broadcastState(room);
    }
  }, 1000);
}

function clearTimers(room: InternalRoom) {
  if (room.questionTimer) {
    clearInterval(room.questionTimer);
    room.questionTimer = null;
  }
  if (room.countdownTimer) {
    clearInterval(room.countdownTimer);
    room.countdownTimer = null;
  }
  room.botTimeouts.forEach((t) => clearTimeout(t));
  room.botTimeouts = [];
}

function startQuestion(room: InternalRoom, questionIndex: number) {
  clearTimers(room);

  const question = INCA_QUESTIONS[questionIndex];
  if (!question) {
    room.status = 'PODIUM';
    broadcastState(room);
    return;
  }

  room.status = 'QUESTION';
  room.currentQuestionIndex = questionIndex;
  room.totalTime = question.timeLimitSeconds;
  room.timeRemaining = question.timeLimitSeconds;
  room.answerCount = 0;
  room.answerDistribution = [0, 0, 0, 0];
  room.questionStartTime = Date.now();

  // Reset last answer for all players
  for (const player of room.players.values()) {
    player.lastAnswer = undefined;
  }

  broadcastState(room);

  // Schedule bot answers
  scheduleBotAnswers(room, questionIndex);

  // Question timer tick every 1000ms
  room.questionTimer = setInterval(() => {
    room.timeRemaining -= 1;

    if (room.timeRemaining <= 0) {
      revealAnswers(room);
    } else {
      broadcastToRoom(room, { type: 'QUESTION_TICK', timeRemaining: room.timeRemaining });
      // Update room state for any listeners
      if (room.timeRemaining % 5 === 0) {
        broadcastState(room);
      }
    }
  }, 1000);
}

function scheduleBotAnswers(room: InternalRoom, questionIndex: number) {
  const currentQ = INCA_QUESTIONS[questionIndex];
  if (!currentQ) return;

  const bots = Array.from(room.players.values()).filter((p) => p.isBot);

  bots.forEach((bot) => {
    // Random response time between 3s and 17s
    const delaySeconds = Math.min(
      currentQ.timeLimitSeconds - 1,
      Math.max(2, Math.floor(Math.random() * (currentQ.timeLimitSeconds - 3)) + 2)
    );

    const timeout = setTimeout(() => {
      if (room.status !== 'QUESTION' || room.currentQuestionIndex !== questionIndex) {
        return;
      }

      // 78% accuracy for bots
      const isCorrect = Math.random() < 0.78;
      let optionIndex = currentQ.correctOptionIndex;
      if (!isCorrect) {
        const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctOptionIndex);
        optionIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      }

      submitPlayerAnswer(room, bot.id, optionIndex);
    }, delaySeconds * 1000);

    room.botTimeouts.push(timeout);
  });
}

function submitPlayerAnswer(room: InternalRoom, playerId: string, optionIndex: number) {
  if (room.status !== 'QUESTION') return;

  const player = room.players.get(playerId);
  if (!player || player.lastAnswer) return; // already answered

  const currentQ = INCA_QUESTIONS[room.currentQuestionIndex];
  if (!currentQ) return;

  const timeTakenSeconds = Math.max(0.5, (Date.now() - room.questionStartTime) / 1000);
  const isCorrect = optionIndex === currentQ.correctOptionIndex;

  let pointsEarned = 0;
  if (isCorrect) {
    // Kahoot speed formula: max 1000 pts down to 500 at last second
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

  room.answerCount += 1;
  if (optionIndex >= 0 && optionIndex <= 3) {
    room.answerDistribution[optionIndex] += 1;
  }

  // Update cumulative question stats
  const currentQStat = room.questionStats[room.currentQuestionIndex];
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

  // Broadcast state update
  broadcastState(room);

  // Check if all connected/bot players have answered
  const activePlayers = Array.from(room.players.values()).filter(
    (p) => p.isBot || p.isConnected
  );
  if (activePlayers.length > 0 && room.answerCount >= activePlayers.length) {
    revealAnswers(room);
  }
}

function revealAnswers(room: InternalRoom) {
  clearTimers(room);
  room.status = 'REVEAL';
  room.timeRemaining = 0;
  broadcastState(room);
}

function showLeaderboard(room: InternalRoom) {
  clearTimers(room);
  room.status = 'LEADERBOARD';
  broadcastState(room);
}

function nextQuestion(room: InternalRoom) {
  clearTimers(room);
  const nextIdx = room.currentQuestionIndex + 1;
  if (nextIdx >= INCA_QUESTIONS.length) {
    room.status = 'PODIUM';
    broadcastState(room);
  } else {
    startQuestion(room, nextIdx);
  }
}

// WebSocket Connection Management
wss.on('connection', (ws) => {
  let boundPin: string | null = null;
  let boundPlayerId: string | null = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as ClientMessage;

      switch (msg.type) {
        case 'HOST_CREATE_ROOM': {
          const pin = generatePin();
          const newRoom: InternalRoom = {
            pin,
            hostWs: ws,
            status: 'LOBBY',
            currentQuestionIndex: 0,
            timeRemaining: 20,
            totalTime: 20,
            players: new Map(),
            answerCount: 0,
            answerDistribution: [0, 0, 0, 0],
            questionStats: createInitialQuestionStats(),
            questionStartTime: 0,
            questionTimer: null,
            countdownTimer: null,
            botTimeouts: [],
          };
          rooms.set(pin, newRoom);
          boundPin = pin;

          ws.send(JSON.stringify({ type: 'ROOM_CREATED', pin }));
          ws.send(JSON.stringify({ type: 'ROOM_STATE_SYNC', state: getPublicRoomState(newRoom) }));
          break;
        }

        case 'HOST_START_GAME': {
          const room = rooms.get(msg.pin);
          if (!room) return;
          startCountdown(room);
          break;
        }

        case 'HOST_ADD_BOTS': {
          const room = rooms.get(msg.pin);
          if (!room || room.status !== 'LOBBY') return;

          const BOT_POOL = [
            { name: 'Dra. Camila', avatar: '🩺' },
            { name: 'Lucas Fitness', avatar: '🏃' },
            { name: 'Bia Nutri', avatar: '🥗' },
            { name: 'Prof. Carlos', avatar: '🔬' },
            { name: 'Ana Prevenção', avatar: '🎗️' },
            { name: 'Dr. Roberto', avatar: '🍎' },
            { name: 'Mariana Solar', avatar: '☀️' },
            { name: 'Tiago Saúde', avatar: '🚴' },
          ];

          const existingNames = new Set(Array.from(room.players.values()).map((p) => p.nickname));
          const availableBots = BOT_POOL.filter((b) => !existingNames.has(b.name));

          const toAdd = availableBots.slice(0, msg.count || 3);
          toAdd.forEach((b) => {
            const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            room.players.set(botId, {
              id: botId,
              nickname: b.name,
              avatar: b.avatar,
              score: 0,
              streak: 0,
              isConnected: true,
              isBot: true,
            });
          });

          broadcastState(room);
          break;
        }

        case 'HOST_SHOW_LEADERBOARD': {
          const room = rooms.get(msg.pin);
          if (!room) return;
          showLeaderboard(room);
          break;
        }

        case 'HOST_NEXT_QUESTION': {
          const room = rooms.get(msg.pin);
          if (!room) return;
          nextQuestion(room);
          break;
        }

        case 'HOST_RESTART': {
          const room = rooms.get(msg.pin);
          if (!room) return;
          clearTimers(room);
          room.status = 'LOBBY';
          room.currentQuestionIndex = 0;
          room.answerCount = 0;
          room.answerDistribution = [0, 0, 0, 0];
          room.questionStats = createInitialQuestionStats();
          // Reset player scores
          for (const player of room.players.values()) {
            player.score = 0;
            player.streak = 0;
            player.lastAnswer = undefined;
          }
          broadcastState(room);
          break;
        }

        case 'PLAYER_JOIN': {
          const room = rooms.get(msg.pin);
          if (!room) {
            ws.send(JSON.stringify({ type: 'PLAYER_JOIN_ERROR', message: 'PIN da sala inválido.' }));
            return;
          }

          if (room.status !== 'LOBBY' && room.status !== 'PODIUM') {
            ws.send(
              JSON.stringify({
                type: 'PLAYER_JOIN_ERROR',
                message: 'O jogo já foi iniciado nesta sala.',
              })
            );
            return;
          }

          const playerId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          boundPin = msg.pin;
          boundPlayerId = playerId;

          const newPlayer: Player & { ws: WebSocket } = {
            id: playerId,
            nickname: msg.nickname.trim() || 'Jogador Anônimo',
            avatar: msg.avatar || '🎗️',
            score: 0,
            streak: 0,
            isConnected: true,
            ws,
          };

          room.players.set(playerId, newPlayer);

          ws.send(
            JSON.stringify({
              type: 'PLAYER_JOIN_SUCCESS',
              playerId,
              player: {
                id: newPlayer.id,
                nickname: newPlayer.nickname,
                avatar: newPlayer.avatar,
                score: newPlayer.score,
                streak: newPlayer.streak,
                isConnected: true,
              },
              roomState: getPublicRoomState(room),
            })
          );

          broadcastState(room);
          break;
        }

        case 'PLAYER_SUBMIT_ANSWER': {
          const room = rooms.get(msg.pin);
          if (!room) return;
          submitPlayerAnswer(room, msg.playerId, msg.optionIndex);
          break;
        }

        case 'PLAYER_LEAVE': {
          const room = rooms.get(msg.pin);
          if (!room) return;
          const player = room.players.get(msg.playerId);
          if (player) {
            player.isConnected = false;
            broadcastState(room);
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    if (boundPin) {
      const room = rooms.get(boundPin);
      if (room) {
        if (room.hostWs === ws) {
          room.hostWs = null;
        }
        if (boundPlayerId && room.players.has(boundPlayerId)) {
          const player = room.players.get(boundPlayerId);
          if (player) {
            player.isConnected = false;
            broadcastState(room);
          }
        }
      }
    }
  });
});

// Configure Vite in development or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Kahoot Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
