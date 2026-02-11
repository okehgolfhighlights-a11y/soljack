import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface GameContextType {
  username: string | null;
  balance: number;
  stats: {
    wins: number;
    losses: number;
    totalHands: number;
    rank: number | null;
  };
  currentTableId: string | null;
  isAtTable: boolean;
  setCurrentTableId: (id: string | null) => void;
  refreshBalance: () => void;
  refreshStats: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [username, setUsername] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    totalHands: 0,
    rank: null as number | null,
  });
  const [currentTableId, setCurrentTableId] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const refreshBalance = async () => {
    if (!publicKey) return;
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const refreshStats = async () => {
    if (!publicKey) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/player/${publicKey.toString()}/stats`);
      if (!response.ok) {
        console.warn('Failed to fetch stats from backend, using defaults');
        return;
      }
      const data = await response.json();
      setStats({
        wins: data.wins || 0,
        losses: data.losses || 0,
        totalHands: data.totalHands || 0,
        rank: data.rank || null,
      });
      setUsername(data.username || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values on error
    }
  };

  useEffect(() => {
    refreshBalance();
    refreshStats();
  }, [publicKey]);

  // WebSocket connection
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    let websocket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
          console.log('✅ WebSocket connected');
          setWs(websocket);

          // Subscribe to current table if any
          if (currentTableId) {
            websocket?.send(JSON.stringify({ event: 'subscribe', tableId: currentTableId }));
          }
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message:', data);
            // Handle events here (to be expanded)
            // Events: table_created, player_joined, card_dealt, etc.
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {
          console.log('⚠️ WebSocket disconnected, reconnecting in 5s...');
          setWs(null);
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  // Subscribe/unsubscribe to table when currentTableId changes
  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (currentTableId) {
      ws.send(JSON.stringify({ event: 'subscribe', tableId: currentTableId }));
    }
  }, [currentTableId, ws]);

  return (
    <GameContext.Provider
      value={{
        username,
        balance,
        stats,
        currentTableId,
        isAtTable: currentTableId !== null,
        setCurrentTableId,
        refreshBalance,
        refreshStats,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}