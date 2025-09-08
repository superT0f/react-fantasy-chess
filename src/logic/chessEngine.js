import { Chess } from 'chess.js';

class ChessEngine {
    constructor() {
        if (!ChessEngine.instance) {
            this.chess = new Chess();
            ChessEngine.instance = this;
        }
        return ChessEngine.instance;
    }

    getChess() {
        return this.chess;
    }

    reset() {
        this.chess.reset();
    }

}

const chessEngine = new ChessEngine();
Object.freeze(chessEngine);

export default chessEngine;