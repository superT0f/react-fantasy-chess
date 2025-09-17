import { Chess, WHITE, BLACK } from 'chess.js';
import { Logger } from '../utils/Logger';
import config from '../config';
import { Move } from '../types/chess';

interface GameState {
    fen: string;
    history: string[];
    players?: string[];
}

interface SendGameStateResponse {
    fen?: string;
    history?: string[];
}

class ChessEngine {
    private chess!: Chess;
    _mode = 'pvp'; // Default mode
    static instance: ChessEngine;
    /**
     * @param {string} value
     */
    set mode(value: string) {
        this._mode = value;
    }
    constructor() {
        if (!ChessEngine.instance) {
            this.chess = new Chess();
            ChessEngine.instance = this;
        }
        return ChessEngine.instance;
    }


    sendGameState = async (gameState: GameState, move: string): Promise<void> => {

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        try {
            const response = await fetch(`${config.apiUrl}?roomId=${roomId}&m=${move}&ChessEngine=1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    gameState
                }),
            });
            const data: SendGameStateResponse = await response.json();
            if (data.fen) {
                this.chess.load(data.fen);
            }
            // if (data.history) {
            //     this.chess.history = () => data.history!;
            // }
            // if (data.capturedByWhite) {
            //     capturedByWhite = data.capturedByWhite;
            // }
            // if (data.capturedByBlack) {
            //     capturedByBlack = data.capturedByBlack;
            // }

        } catch (error) {
            console.error('Error sending game state:', error);
        }
    }
    getChess() {
        return this.chess || (this.chess = new Chess());
    }

    reset() {
        this.chess.reset();
    }
    load(fen: string) {
        return this.chess.load(fen);
    }
    move(move:Move) {
        const moveString = move.from + move.to + (move.promotion ? move.promotion : '');
        Logger.debug('Attempting move:', moveString);
        Logger.debug('mode:', this._mode);
        const moveResult = this.chess.move(move);
        if (this._mode === 'online') {
            const gameState = {
                fen: this.chess.fen(),
                history: this.chess.history(),
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