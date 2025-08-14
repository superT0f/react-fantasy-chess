import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import PgnNotation from './logic/PgnNotation';
import Entity from './logic/Entity';

export default function Game() {
  const initialChessBoard = [
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
  ];

  const [history, setHistory] = useState([{
    squares: initialChessBoard,
    pgn: 'Start'
  }]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'checkmate', 'stalemate', 'timeout'
  const [winner, setWinner] = useState(null); // 'white', 'black', null

  const [currentMove, setCurrentMove] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const current = history[currentMove];
  const currentSquares = current ? current.squares : initialChessBoard;
  const currentPlayer = currentMove % 2 === 0 ? 'white' : 'black';

  const [timeLeft, setTimeLeft] = useState({
    white: 600, // 10 min
    black: 600
  });
  const timerRef = useRef(null);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const isTimeout = timeLeft.white <= 0 || timeLeft.black <= 0;
    if (isTimeout) {
      setGameStatus('timeout');
      setWinner(timeLeft.white <= 0 ? 'black' : 'white');
      clearInterval(timerRef.current);
    }
  }, [timeLeft, gameStatus]);


  // short timer warning
  useEffect(() => {
    if (timeLeft.white <= 30 || timeLeft.black <= 30) {
      const whiteTimer = document.querySelector('.timer.white');
      const blackTimer = document.querySelector('.timer.black');

      if (timeLeft.white <= 30) whiteTimer?.classList.add('low-time');
      if (timeLeft.black <= 30) blackTimer?.classList.add('low-time');
    }
  }, [timeLeft]);

  function startTimer() {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = { ...prev };
        newTime[currentPlayer] = Math.max(0, newTime[currentPlayer] - 1);

        if (newTime[currentPlayer] <= 0) {
          clearInterval(timerRef.current);
          alert(`${currentPlayer === 'white' ? 'Black' : 'White'} wins by time!`);
        }

        return newTime;
      });
    }, 1000);
  }
  startTimer();
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function VictoryMessage() {
    if (gameStatus === 'playing') return null;

    const messages = {
      checkmate: `${winner === 'white' ? 'WHITE' : 'BLACK'} WINS BY CHECKMATE!`,
      stalemate: "STALEMATE! IT'S A DRAW!",
      timeout: `${winner === 'white' ? 'WHITE' : 'BLACK'} WINS BY TIMEOUT!`
    };

    const emojis = {
      white: '🎉👑🎉',
      black: '🎉🏴🎉',
      draw: '🤝'
    };

    return (
      <div className="victory-message">
        <div className="victory-text">
          {messages[gameStatus]}
        </div>
        <div className="victory-emoji">
          {gameStatus === 'stalemate' ? emojis.draw : emojis[winner]}
        </div>
        <button
          className="play-again"
          onClick={() => window.location.reload()}
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  function handleMove(nextSquares,
    from, to, captured, isEnPassant) {

    if (gameStatus !== 'playing') return false;

    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    const isOpponentInCheckmate = Entity.isCheckmate(nextSquares, opponent);
    const isOpponentInStalemate = !isOpponentInCheckmate &&
      Entity.isStalemate(nextSquares, opponent);

    if (isOpponentInCheckmate) {
      setGameStatus('checkmate');
      setWinner(currentPlayer);
      clearInterval(timerRef.current);
      return true;
    }

    if (isOpponentInStalemate) {
      setGameStatus('stalemate');
      clearInterval(timerRef.current);
      return true;
    }


    const pgn = PgnNotation.getMoveNotation(
      from,
      to,
      currentSquares[from],
      captured,
      isEnPassant,
      Entity.isCheck(nextSquares, currentPlayer),
      isOpponentInCheckmate
    );
    if (Entity.isCheck(nextSquares, currentPlayer)) {
      return;
    }
    const nextHistory = [...history.slice(0, currentMove + 1), {
      squares: nextSquares,
      pgn: pgn
    }];

    if (isEnPassant) {
      nextHistory[captured] = '';
    }
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setLastMove({
      from: PgnNotation.idxToXY(from),
      to: PgnNotation.idxToXY(to),
      piece: currentSquares[from],
      captured,
      notation: pgn
    });

    return true;
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }
  const moves = [];
  if (history.length >= 2)
    for (let i = 1; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];

      let description = ``;
      if (whiteMove && whiteMove.pgn && whiteMove.pgn !== 'Start') {
        description += ` ${whiteMove.pgn}`;
      }
      if (blackMove && blackMove.pgn) {
        description += `   -   ${blackMove.pgn}`;
      }

      moves.push(
        <li key={i}>
          <button className="move" onClick={() => jumpTo(i)}>{description}</button>
        </li>
      );
    }

  return (
    <div className="game">
      <VictoryMessage />
      <div className="board-container">
        <div className="timer-container">
          <div className={`timer white ${currentPlayer === 'white' ? 'active' : ''}`}>
            White: {formatTime(timeLeft.white)}
          </div>
          <div className={`timer black ${currentPlayer === 'black' ? 'active' : ''}`}>
            Black: {formatTime(timeLeft.black)}
          </div>
        </div>
        <div className="game-content">
          <div className="game-board">
            <Board
              currentPlayer={currentPlayer}
              squares={currentSquares}
              onMove={handleMove}
              lastMove={lastMove}
              gameStatus={gameStatus}
            />
          </div>
          <div className="game-info">
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    </div>
  );
}
