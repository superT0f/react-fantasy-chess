import { Chess, Move, WHITE, BLACK } from 'chess.js';
import Log from '../Log';
import config from '../config';
class ChessEngine {
    _mode = 'pvp'; // Default mode
    /**
     * @param {string} value
     */
    set mode(value) {
        this._mode = value;
    }
    constructor() {
        if (!ChessEngine.instance) {
            this.chess = new Chess();
            ChessEngine.instance = this;
        }
        return ChessEngine.instance;
    }
    sendGameState = async (gameState, move) => {

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        try {
            const data = await fetch(`${config.apiUrl}?roomId=${roomId}&m=${move}&ChessEngine=1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    gameState
                }),
            });
            if (data.fen) {
                this.chess.load(data.fen);
            }
            if (data.history) {
                this.chess.history = () => data.history;
            }
            if (data.capturedByWhite) {
                capturedByWhite = data.capturedByWhite;
            }
            if (data.capturedByBlack) {
                capturedByBlack = data.capturedByBlack;
            }

        } catch (error) {
            console.error('Error sending game state:', error);
        }
    }
    getChess() {
        return this.chess;
    }

    reset() {
        this.chess.reset();
    }
    load(fen) {
        return this.chess.load(fen);
    }
    move(
        /** @type Move */
        move) {
        const moveString = move.from + move.to + (move.promotion ? move.promotion : '');
        Log.debug('Attempting move:', moveString);
        Log.debug('mode:', this._mode);
        const moveResult = this.chess.move(move);
        if (this._mode === 'online') {
            const gameState = {
                fen: this.chess.fen(),
                history: this.chess.history(),
                // capturedByWhite,
                // capturedByBlack,
                players: this.chess.turn() === WHITE ? [WHITE, BLACK] : [BLACK, WHITE]
            };
            this.sendGameState(gameState, move.from + move.to + (move.promotion ? move.promotion : ''));
        }

        return moveResult;
    }
}

const chessEngine = new ChessEngine();
// Object.freeze(chessEngine);

export default chessEngine;