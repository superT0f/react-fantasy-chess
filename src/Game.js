import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import { PromotionModal } from './components/Game/PromotionModal'
import { VictoryMessage } from './components/Game/VictoryMessage';
import { GameModeSelection } from './components/Game/GameModeSelection';
import { MoveHistory } from './components/Game/MoveHistory';
import { TimerDisplay } from './components/TimerDisplay';
import { useChessTimer } from './hooks/useChessTimer';
import { useAIController } from './logic/AIController';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Referee from './logic/Referee';
import Entity from './logic/Entity';
import PgnNotation from './logic/PgnNotation';
import MoveData from './logic/MoveData';
import { Graveyard } from './components/Graveyard';
import Log from './Log';
import { PuzzleGameComponent } from './components/Game/PuzzleGame';
import PuzzleGame from './logic/PuzzleGame';




export default function Game() {
  const { theme } = useTheme();
  const [referee] = useState(new Referee());
  const [gameMode, setGameMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [isAiAggressive, setIsAiAggressive] = useState(true);
  const [promotionSquares, setPromotionSquares] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);



  const [puzzleMode, setPuzzleMode] = useState(false);
  const [puzzleGame] = useState(new PuzzleGame(referee));


  const [feedback, setFeedback] = useState('');
  const { isAiThinking, setIsAiThinking, makeAiMove } = useAIController({
    gameMode,
    aiDifficulty,
    isAiAggressive,
    referee,
    gameStatus
  });

  const {
    timeLeft,
    currentPlayer: timerPlayer,
    startTimer,
    stoptTimers,
    switchPlayer,
    formatTime,
    resetTimer
  } = useChessTimer(600);

  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  const computeGraveDiff = () => {
    const eValues = {
      'p': 1, 'P': 1,
      'n': 3, 'N': 3,
      'b': 3, 'B': 3,
      'r': 5, 'R': 5,
      'q': 10, 'Q': 10
    };

    const whiteScore = capturedByWhite.reduce((sum, piece) => sum + (eValues[piece] || 0), 0);
    const blackScore = capturedByBlack.reduce((sum, piece) => sum + (eValues[piece] || 0), 0);

    return {
      white: whiteScore - blackScore,
      black: blackScore - whiteScore
    };
  };

  function startNewGame(mode, difficulty = 'easy', aggressive = true) {
    Log.debug(`startNewGame with mode:${mode}, difficulty:${difficulty}, aggressive:${aggressive}`);

    referee.reset();
    resetTimer();
    startTimer('white', onTimeout);
    setGameMode(mode);
    setAiDifficulty(difficulty);
    setIsAiAggressive(aggressive);
    setGameStatus('playing');
    setWinner(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }

  const handlePromotion = (from, to) => {
    setPromotionSquares({ from: from, to: to });
    setShowPromotionModal(true);
  };

  function handleMove(moveData) {
    if (puzzleMode) {
      handlePuzzleMove(moveData);
      return true;
    }

    if (gameStatus !== 'playing') {
      Log.debug('Game not in playing state, ignoring move');
      return false;
    }
    const currentPlayer = referee.getCurrentPlayer();
    // Check if this is an AI move that requires promotion
    const isAiMove = moveData.isFromIA;
    const isPromotionMove = referee.isPromotionMove(moveData.from, moveData.to);

    // If it's an AI move that requires promotion, auto-promote to queen
    if (isAiMove && isPromotionMove && !moveData.isPromotion) {
      Log.debug('AI promotion detected, auto-promoting to queen');
      moveData.isPromotion = true;
      moveData.promotionPiece = 'q';

      // Update the squares with the promoted piece
      const newSquares = [...moveData.squares];
      const promotionChar = currentPlayer === 'white' ? 'Q' : 'q';
      newSquares[moveData.to] = promotionChar;
      moveData.squares = newSquares;
    }

    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    const { squares, isFromIA } = moveData;

    if (moveData.captured) {
      if (currentPlayer === 'white') {
        setCapturedByWhite(prev => [...prev, moveData.captured]);
      } else {
        setCapturedByBlack(prev => [...prev, moveData.captured]);
      }
    }


    referee.recordMove(moveData);

    const lastMoveData = referee.getLastMove();
    const lastMoveNotation = lastMoveData ? lastMoveData.pgn : '';

    setLastMove({
      from: PgnNotation.idxToXY(moveData.from),
      to: PgnNotation.idxToXY(moveData.to),
      piece: moveData.promotionPiece || referee.getSquare(moveData.from),
      captured: moveData.captured,
      notation: lastMoveNotation
    });
    // Get the UPDATED board after the move was recorded
    const updatedBoard = referee.getCurrentBoard();
    const isOpponentInCheckmate = referee.isCheckmate(updatedBoard, opponent);
    const isOpponentInStalemate = !isOpponentInCheckmate && referee.isStalemate(updatedBoard, opponent);




    if (isOpponentInCheckmate) {
      stoptTimers();
      setWinner(currentPlayer);
      setGameStatus('checkmate');
      return true;
    } else if (isOpponentInStalemate) {
      stoptTimers();
      setGameStatus('stalemate');
      return true;
    }

    const newPlayer = referee.getCurrentPlayer();
    switchPlayer(newPlayer, onTimeout);

    if (gameMode === 'ai' && !isFromIA && newPlayer === 'black') {
      setIsAiThinking(true);
      setTimeout(() => {
        makeAiMove(updatedBoard, handleMove, setIsAiThinking);

      }, 1500);
    }

    return true;
  }


  const handlePuzzleMove = (moveData) => {
    Log.debug(`handlePuzzleMove`);
    Log.debug(moveData);
    const result = puzzleGame.validateMove(moveData);

    if (result.isValid) {
      // Process the move normally
      //handleMove(moveData);
      referee.recordMove(moveData);
      setFeedback(result.feedback);
      if (result.isComplete) {
        // Puzzle completed, you might want to show a celebration
        Log.debug('Puzzle completed!');
      }
    } else {
      Log.debug('handlePuzzleMove move not valid!');
      Log.debug(moveData);
    }
  };


  const graveDiff = computeGraveDiff();

  const onTimeout = () => {
    setGameStatus('timeout');
    setWinner(referee.getCurrentPlayer() === 'white' ? 'black' : 'white');
    clearInterval(timerRef.current);
  };

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

  return (
    <ThemeProvider>
      <div className={`game theme-${localStorage.getItem('chessTheme') || theme}`}>
        {!gameMode && !puzzleMode ? (
          <GameModeSelection
            onStartNewGame={startNewGame}
            onStartPuzzle={() => setPuzzleMode(true)}
          />
        ) : puzzleMode ? (
          <>
            <PuzzleGameComponent
              puzzleGame={puzzleGame}
              feedback={feedback}
              onExit={() => {
                setPuzzleMode(false);
                setGameMode(null);
              }}
            />
            <div className="board-container">
              <div className="game-board">
                <Board
                  onMove={handlePuzzleMove}
                  onPromotion={handlePromotion}
                  lastMove={lastMove}
                  gameStatus={gameStatus}
                  referee={referee}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <VictoryMessage
              gameStatus={gameStatus}
              winner={winner}
              onPlayAgain={() => window.location.reload()}
            />

            {showPromotionModal && (
              <PromotionModal
                square={promotionSquares.to}
                color={referee.getCurrentPlayer()}
                onSelect={(piece) => {
                  // Handle promotion selection
                  const moveData = new MoveData({
                    from: promotionSquares.from,
                    to: promotionSquares.to,
                    squares: referee.getCurrentBoard(),
                    isPromotion: true,
                    promotionPiece: piece,
                    isFromIA: false
                  });
                  handleMove(moveData);
                  setShowPromotionModal(false);
                  setPromotionSquares(null);
                }}
                onClose={() => {
                  setShowPromotionModal(false);
                  setPromotionSquares(null);
                }}
              />
            )}

            {isAiThinking && <div className="ai-thinking">AI is thinking...</div>}
            <div className="board-container">
              <div className="game-content">
                <div className="graveyard-contant">
                  <Graveyard
                    captured={capturedByBlack}
                    player="black"
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    graveDiff={graveDiff.black > 0 ? graveDiff.black : 0}
                    active={referee.getCurrentPlayer() === 'black'}
                  />
                  <Graveyard
                    captured={capturedByWhite}
                    player="white"
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    graveDiff={graveDiff.white > 0 ? graveDiff.white : 0}
                    active={referee.getCurrentPlayer() === 'white'}
                  />
                </div>
                {/* <TimerDisplay
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    player='black'
                    active={referee.getCurrentPlayer() === 'black'}
                  /> */}
                <div className="game-board">
                  <Board
                    onMove={puzzleMode ? handlePuzzleMove : handleMove}
                    onPromotion={handlePromotion}
                    lastMove={lastMove}
                    gameStatus={gameStatus}
                    referee={referee}
                  />
                </div>
                {/* <TimerDisplay
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    player='white'
                    active={referee.getCurrentPlayer() === 'white'}
                  /> */}
                <div className="game-info">
                  <MoveHistory
                    history={referee.getHistory()}
                    onJumpToMove={(i) => referee.jumpTo(i)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}