import { Color } from 'chess.js';
import { useState, useRef, useCallback, useEffect } from 'react';

export function useChessTimer(initialTime: number = 600) {
  const [timeLeft, setTimeLeft] = useState({ 'w': initialTime, 'b': initialTime });
  const [currentPlayer, setCurrentPlayer] = useState<Color | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPlayerRef = useRef<Color | null>(null);

  // Sync ref with state
  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  const startTimer = useCallback((player: Color, onTimeout: () => void) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCurrentPlayer(player);
    currentPlayerRef.current = player;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const current = currentPlayerRef.current;
        if (!current) return prev;

        const newTime = { ...prev };
        newTime[current] = Math.max(0, newTime[current] - 1);

        // Check for timeout
        if (newTime[current] <= 0) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          timerRef.current = null;
          onTimeout();
        }

        return newTime;
      });
    }, 1000);
  }, []);

  const stopTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentPlayer(null);
    currentPlayerRef.current = null;
  }, []);

  const switchPlayer = useCallback((newPlayer: Color, onTimeout: () => void) => {
    startTimer(newPlayer, onTimeout);
  }, [startTimer]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  const resetTimer = useCallback(() => {
    stopTimers();
    setTimeLeft({ 'w': initialTime, 'b': initialTime });
  }, [initialTime, stopTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return { 
    timeLeft, 
    startTimer,
    stopTimers, 
    switchPlayer,
    formatTime, 
    resetTimer,
    currentPlayer
  };
}