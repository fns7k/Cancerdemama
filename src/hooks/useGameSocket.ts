import { useEffect, useRef, useState, useCallback } from 'react';
import { ClientMessage, Player, RoomState, ServerMessage } from '../types/quiz';
import { localGameEngine } from '../utils/localGameEngine';

export function useGameSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [engineMode, setEngineMode] = useState<'websocket' | 'local'>('websocket');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerInfo, setPlayerInfo] = useState<Player | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFallbackActiveRef = useRef(false);

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'ROOM_STATE_SYNC': {
        setRoomState(msg.state);
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
  }, []);

  const activateLocalFallback = useCallback(() => {
    if (isFallbackActiveRef.current) return;
    isFallbackActiveRef.current = true;
    setEngineMode('local');
    setIsConnected(true);

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    }

    // Subscribe to local engine events
    const unsubscribe = localGameEngine.subscribe(handleServerMessage);

    // Auto-create room in local engine if none exists
    localGameEngine.handleClientMessage({ type: 'HOST_CREATE_ROOM' });

    return unsubscribe;
  }, [handleServerMessage]);

  useEffect(() => {
    // If running in browser, attempt WebSocket with a strict 1500ms timeout
    let unsubscribeLocal: (() => void) | undefined;

    // Timeout: if WebSocket does not connect in 1500ms (like on Vercel), fall back immediately
    fallbackTimerRef.current = setTimeout(() => {
      if (!isFallbackActiveRef.current && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        console.warn('WebSocket connection timed out or unavailable. Switching to Local Game Engine for Vercel/Static hosting.');
        unsubscribeLocal = activateLocalFallback();
      }
    }, 1500);

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}`;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        setEngineMode('websocket');
        setIsConnected(true);
        setJoinError(null);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          handleServerMessage(msg);
        } catch (e) {
          console.error('Error parsing socket message:', e);
        }
      };

      socket.onerror = () => {
        if (!isFallbackActiveRef.current) {
          console.warn('WebSocket error encountered. Switching to Local Game Engine.');
          unsubscribeLocal = activateLocalFallback();
        }
      };

      socket.onclose = () => {
        if (!isFallbackActiveRef.current) {
          console.warn('WebSocket closed before connection. Switching to Local Game Engine.');
          unsubscribeLocal = activateLocalFallback();
        }
      };
    } catch (e) {
      console.warn('Failed to construct WebSocket. Switching to Local Game Engine:', e);
      unsubscribeLocal = activateLocalFallback();
    }

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (unsubscribeLocal) unsubscribeLocal();
    };
  }, [activateLocalFallback, handleServerMessage]);

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
    if (!isFallbackActiveRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      localGameEngine.handleClientMessage(message);
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

  const forceLocalMode = useCallback(() => {
    activateLocalFallback();
  }, [activateLocalFallback]);

  return {
    isConnected,
    engineMode,
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
    forceLocalMode,
  };
}
