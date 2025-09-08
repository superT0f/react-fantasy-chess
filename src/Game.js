import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import { PromotionModal } from './components/Game/PromotionModal'
import { VictoryMessage } from './components/Game/VictoryMessage';
import { GameModeSelection } from './components/Game/GameModeSelection';
import { MoveHistory } from './components/Game/MoveHistory';
import { useChessTimer } from './hooks/useChessTimer';
import { useAIController } from './logic/AIController';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Graveyard } from './components/Graveyard';
import Log from './Log';
import { PuzzleGameComponent } from './components/Game/PuzzleGame';
import PuzzleGame from './logic/PuzzleGame';
import chessEngine from './logic/chessEngine';
import { WHITE, Chess, BLACK, Move } from 'chess.js';

export default function Game() {
  /** @type {Chess} */
  const chess = chessEngine.getChess();
  const { theme } = useTheme();
  const [gameMode, setGameMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [aiColor, setAiColor] = useState(BLACK);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [isAiAggressive, setIsAiAggressive] = useState(true);
  const [promotionSquares, setPromotionSquares] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  const [puzzleMode, setPuzzleMode] = useState(false);
  const [puzzleGame] = useState(new PuzzleGame());
  const [feedback, setFeedback] = useState('');
  const { isAiThinking, setIsAiThinking, makeAiMove } = useAIController({
    gameMode,
    aiDifficulty,
    isAiAggressive,
    chessEngine,
    gameStatus
  });

  const {
    timeLeft,
    startTimer,
    stoptTimers,
    switchPlayer,
    formatTime,
    resetTimer
  } = useChessTimer(600);

  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);
  const updateCaptured = (
    /** @type PieceSymbol */
    piece_type,
  ) => {
    if (!piece_type) return;
    if (chess.turn() === WHITE) {
      setCapturedByWhite(prev => [...prev, piece_type]);
    } else {
      setCapturedByBlack(prev => [...prev, piece_type]);
    }
  };
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

  function startNewGame(mode, difficulty = 'easy', aggressive = true, aiColor = BLACK) {
    Log.debug(`startNewGame =
        mode         :${mode},
        difficulty   :${difficulty}, 
        aggressive   :${aggressive}, 
        aiColor      :${aiColor}`);
    chess.reset();
    resetTimer();
    startTimer('white', onTimeout);
    setGameMode(mode);
    setAiDifficulty(difficulty);
    setAiColor(aiColor);
    setIsAiAggressive(aggressive);
    setGameStatus('playing');
    setWinner(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    if (mode === 'ai' && aiColor === WHITE) {
      setIsAiThinking(true);
      setTimeout(() => {
        makeAiMove(handleMove, setIsAiThinking);
      }, 1500);
    }
  }

  const handlePromotion = (from, to) => {
    setPromotionSquares({ from: from, to: to });
    setShowPromotionModal(true);
  };

  function handleMove(
    /**
     * @type {Move} */
    move) {
    if (puzzleMode) {
      handlePuzzleMove(move);
      return true;
    }

    if (gameStatus !== 'playing') {
      Log.debug('Game not in playing state, ignoring move');
      return false;
    }

    if (move.captured) {
      updateCaptured(move.captured);
    }

    const lastMoveData = move;
    const lastMoveNotation = lastMoveData ? lastMoveData.pgn : '';

    setLastMove({
      from: move.from,
      to: move.to,
      piece: move.promotion || chess.get(move.from),
      captured: move.captured,
      notation: lastMoveNotation
    });
    if (chess.isCheckmate()) {
      // side to move is checkmated : looser
      const winner = (chess.turn() === WHITE) ? 'BLACK' : 'WHITE';
      stoptTimers();
      setWinner(winner);
      setGameStatus('checkmate');
      return true;
    }
    if (chess.isStalemate()) {
      stoptTimers();
      setGameStatus('stalemate');
      return true;
    }

    // timer switch
    const newPlayer = (chess.turn() === WHITE) ? 'BLACK' : 'WHITE';
    switchPlayer(newPlayer, onTimeout);

    // trigger ai move after player
    const isAITurn = (aiColor === chess.turn());
    if (gameMode === 'ai' && isAITurn) {
      setIsAiThinking(true);
      setTimeout(() => {
        makeAiMove(handleMove, setIsAiThinking);

      }, 1500);
    }

    return true;
  }


  const handlePuzzleMove = (move) => {
    Log.debug(`handlePuzzleMove`);
    Log.debug(move);
    const result = puzzleGame.validateMove(move);

    if (result.isValid) {
      // Process the move normally
      handleMove(chess.move({ from: move.from, to: move.to, promotion: move.promotion }));

      setFeedback(result.feedback);
      if (result.isComplete) {
        // Puzzle completed, you might want to show a celebration
        Log.debug('Puzzle completed!');
      }
    } else {
      Log.debug('handlePuzzleMove move not valid!');
      Log.debug(move);
    }
  };


  const graveDiff = computeGraveDiff();

  const onTimeout = () => {
    // side to move is loosing by time
    const winner = (chess.turn === WHITE) ? 'BLACK' : 'WHITE';
    setGameStatus('timeout');
    setWinner(winner);
    clearInterval(timerRef.current);
  };

  const timerRef = useRef(null);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const isTimeout = timeLeft.white <= 0 || timeLeft.black <= 0;
    if (isTimeout) {
      setGameStatus('timeout');
      setWinner(timeLeft.white <= 0 ? 'BLACK' : 'WHITE');
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
                color={chess.turn()}
                onSelect={(piece) => {
                  handleMove(chess.move(
                    {
                      from: promotionSquares.from,
                      to: promotionSquares.to,
                      promotion: piece?.type
                    }
                  ));
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
                    active={!chess.isGameOver && chess.turn() === 'black'}
                  />
                  <Graveyard
                    captured={capturedByWhite}
                    player="white"
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    graveDiff={graveDiff.white > 0 ? graveDiff.white : 0}
                    active={!chess.isGameOver && chess.turn() === 'white'}
                  />
                </div>
                <div className="game-board">
                  <Board
                    onMove={puzzleMode ? handlePuzzleMove : handleMove}
                    onPromotion={handlePromotion}
                    lastMove={lastMove}
                    gameStatus={gameStatus}
                  />
                </div>
                <div className="game-info">
                  <MoveHistory
                    history={chess.history()}
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