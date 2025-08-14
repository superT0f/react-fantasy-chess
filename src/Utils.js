export default class Utils {
    static displayChessBoard(squares) {

        const pieceSymbols = {
            'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
            'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
            '': '·'
        };

        console.log('  a b c d e f g h');
        console.log('  -----------------');

        for (let row = 0; row < 8; row++) {
            let rowStr = `${8 - row}|`;
            for (let col = 0; col < 8; col++) {
                const index = row * 8 + col;
                const piece = squares[index];
                rowStr += pieceSymbols[piece] || pieceSymbols[''];
                rowStr += ' ';
            }
            console.log(rowStr + `|${8 - row}`);
        }

        console.log('  -----------------');
        console.log('  a b c d e f g h');
    }
}