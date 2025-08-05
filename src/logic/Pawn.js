import Piece from './Piece';

export default class Pawn extends Piece {
  getValidMoves(board) {
    const moves = [];
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;
    const currentRow = Math.floor(this.position / 8);
    const currentCol = this.position % 8;
    
    // 1 square forward
    const oneStep = this.position + 8 * direction;
    if (board[oneStep] === '') {
      moves.push(oneStep);
      
      // 2 squares forward from starting position
      if (currentRow === startRow) {
        const twoSteps = this.position + 16 * direction;
        if (board[twoSteps] === '') {
          moves.push(twoSteps);
        }
      }
    }
    
    const captureMoves = [
      this.position + 8 * direction - 1,
      this.position + 8 * direction + 1
    ];
    
    for (const move of captureMoves) {
      if (move >= 0 && move < 64 && 
          Math.abs(move % 8 - currentCol) === 1 &&
          board[move] !== '' && 
          this.color !== board.getPieceColor(move)) {
        moves.push(move);
      }
    }
    
    return moves;
  }
}