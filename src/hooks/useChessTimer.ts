import { Color } from 'chess.js';
import { useState, useRef, useCallback } from 'react';

export function useChessTimer(initialTime:number = 600) {
  const [timeLeft, setTimeLeft] = useState({ 'w': initialTime, 'b': initialTime });
  const [currentPlayer, setCurrentPlayer] = useState<Color|null>(null);
  const timerRef = useRef<number>(undefined);

  const startTimer = useCallback((player:Color, onTimeout:any) => {
    clearInterval(timerRef.current);
    setCurrentPlayer(player);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (!currentPlayer) return prev;
        const newTime = { ...prev };
        newTime[currentPlayer] = Math.max(0, newTime[currentPlayer] - 1);

        if (newTime[currentPlayer] <= 0) {
          clearInterval(timerRef.current);
          onTimeout?.(currentPlayer);
        }

        return newTime;
      });
    }, 1000) as unknown as number;
  }, []);


  const stoptTimers = () => {
    clearInterval(timerRef.current);
    setCurrentPlayer(null);
  }

  const switchPlayer = useCallback((newPlayer: Color, onTimeout: Function) => {
    startTimer(newPlayer, onTimeout);
  }, [startTimer]);

  const formatTime = (seconds:number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = () => {
    setTimeLeft({ 'w': initialTime, 'b': initialTime });
    setCurrentPlayer(null);
    clearInterval(timerRef.current);
  };

  return { 
    timeLeft, 
    startTimer,
    stoptTimers,
    switchPlayer,
    formatTime, 
    resetTimer 
  };
}