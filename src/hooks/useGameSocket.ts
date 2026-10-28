import { useEffect, useRef, useState, useCallback } from 'react';
import { ClientMessage, Player, RoomState, ServerMessage } from '../types/quiz';

export function useGameSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerInfo, setPlayerInfo] = useState<Player | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setJoinError(null);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;

          switch (msg.type) {
            case 'ROOM_STATE_SYNC': {
              setRoomState(msg.state);
              // Update player's own info if in room
              if (playerId) {
                const me = msg.state.players.find((p) => p.id === playerId);
                if (me) setPlayerInfo(me);
              }
              break;
            }

            case 'PLAYER_JOIN_SUCCESS': {
              setPlayerId(msg.playerId);
              setPlayerInfo(msg.player);
              setRoomState(msg.roomState);
              setJoinError(null);
              break;
            }

            case 'PLAYER_JOIN_ERROR': {
              setJoinError(msg.message);
              break;
            }

            case 'QUESTION_TICK': {
              setRoomState((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  timeRemaining: msg.timeRemaining,
                };
              });
              break;
            }
          }
        } catch (e) {
          console.error('Error parsing socket message:', e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Try reconnecting after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
    }
  }, [playerId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  // Keep playerInfo in sync when roomState changes
  useEffect(() => {
    if (playerId && roomState) {
      const me = roomState.players.find((p) => p.id === playerId);
      if (me) {
        setPlayerInfo(me);
      }
    }
  }, [playerId, roomState]);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const hostCreateRoom = useCallback(() => {
    send({ type: 'HOST_CREATE_ROOM' });
  }, [send]);

  const hostStartGame = useCallback((pin: string) => {
    send({ type: 'HOST_START_GAME', pin });
  }, [send]);

  const hostAddBots = useCallback((pin: string, count = 3) => {
    send({ type: 'HOST_ADD_BOTS', pin, count });
  }, [send]);

  const hostNextQuestion = useCallback((pin: string) => {
    send({ type: 'HOST_NEXT_QUESTION', pin });
  }, [send]);

  const hostShowLeaderboard = useCallback((pin: string) => {
    send({ type: 'HOST_SHOW_LEADERBOARD', pin });
  }, [send]);

  const hostRestart = useCallback((pin: string) => {
    send({ type: 'HOST_RESTART', pin });
  }, [send]);

  const playerJoin = useCallback((pin: string, nickname: string, avatar: string) => {
    setJoinError(null);
    send({ type: 'PLAYER_JOIN', pin, nickname, avatar });
  }, [send]);

  const playerSubmitAnswer = useCallback((pin: string, pId: string, optionIndex: number) => {
    send({ type: 'PLAYER_SUBMIT_ANSWER', pin, playerId: pId, optionIndex });
  }, [send]);

  const playerLeave = useCallback((pin: string, pId: string) => {
    send({ type: 'PLAYER_LEAVE', pin, playerId: pId });
    setPlayerId(null);
    setPlayerInfo(null);
  }, [send]);

  return {
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
  };
}
