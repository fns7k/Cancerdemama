export type ShapeType = 'triangle' | 'diamond' | 'circle' | 'square';

export interface OptionItem {
  id: number; // 0, 1, 2, 3
  letter: 'A' | 'B' | 'C' | 'D';
  shape: ShapeType;
  colorName: 'red' | 'blue' | 'yellow' | 'green';
  bgClass: string;
  hoverClass: string;
  activeClass: string;
  borderClass: string;
  text: string;
}

export interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: OptionItem[];
  correctOptionIndex: number;
  explanation: string;
  incaSourceUrl?: string;
  timeLimitSeconds: number;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  lastAnswer?: {
    optionIndex: number;
    timeTakenSeconds: number;
    isCorrect: boolean;
    pointsEarned: number;
  };
  isConnected: boolean;
  isBot?: boolean;
}

export type GameStateStatus =
  | 'LOBBY'
  | 'COUNTDOWN'
  | 'QUESTION'
  | 'REVEAL'
  | 'LEADERBOARD'
  | 'PODIUM';

export interface QuestionStat {
  questionIndex: number;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  answerDistribution: [number, number, number, number];
}

export interface RoomState {
  pin: string;
  status: GameStateStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalTime: number;
  players: Player[];
  answerCount: number;
  answerDistribution: [number, number, number, number];
  questionStats?: QuestionStat[];
}

export type ClientMessage =
  | { type: 'HOST_CREATE_ROOM' }
  | { type: 'HOST_START_GAME'; pin: string }
  | { type: 'HOST_ADD_BOTS'; pin: string; count: number }
  | { type: 'HOST_NEXT_QUESTION'; pin: string }
  | { type: 'HOST_SHOW_LEADERBOARD'; pin: string }
  | { type: 'HOST_RESTART'; pin: string }
  | { type: 'PLAYER_JOIN'; pin: string; nickname: string; avatar: string }
  | { type: 'PLAYER_SUBMIT_ANSWER'; pin: string; playerId: string; optionIndex: number }
  | { type: 'PLAYER_LEAVE'; pin: string; playerId: string };

export type ServerMessage =
  | { type: 'ROOM_CREATED'; pin: string }
  | { type: 'ROOM_STATE_SYNC'; state: RoomState }
  | { type: 'PLAYER_JOIN_SUCCESS'; playerId: string; player: Player; roomState: RoomState }
  | { type: 'PLAYER_JOIN_ERROR'; message: string }
  | { type: 'QUESTION_TICK'; timeRemaining: number }
  | { type: 'ALL_ANSWERED'; pin: string }
  | { type: 'ERROR'; message: string };
