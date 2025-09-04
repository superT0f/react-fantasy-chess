import { useState, useRef, useCallback } from 'react';

export function useChessTimer(initialTime = 600) {
  const [timeLeft, setTimeLeft] = useState({ white: initialTime, black: initialTime });
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const timerRef = useRef(null);

  const startTimer = useCallback((player, onTimeout) => {
    clearInterval(timerRef.current);
    setCurrentPlayer(player);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = { ...prev };
        newTime[player] = Math.max(0, newTime[player] - 1);

        if (newTime[player] <= 0) {
          clearInterval(timerRef.current);
          onTimeout?.(player);
        }

        return newTime;
      });
    }, 1000);
  }, []);


  const stoptTimers = () => {
    clearInterval(timerRef.current);
    setCurrentPlayer(null);
  }

  const switchPlayer = useCallback((newPlayer, onTimeout) => {
    startTimer(newPlayer, onTimeout);
  }, [startTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = () => {
    setTimeLeft({ white: initialTime, black: initialTime });
    setCurrentPlayer(null);
    clearInterval(timerRef.current);
  };

  return { 
    timeLeft, 
    currentPlayer,
    startTimer,
    stoptTimers,
    switchPlayer,
    formatTime, 
    resetTimer 
  };
}