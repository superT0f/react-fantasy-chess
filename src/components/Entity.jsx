
const Piece = ({ piece }) => {
  if (!piece) return null;
  
  const color     = piece === piece.toUpperCase() ? 'w' : 'b';
  const pieceType = piece.toLowerCase();
  const pieceMap  = {
    'p': 'pawn',
    'r': 'rook',
    'n': 'knight',
    'b': 'bishop',
    'q': 'queen',
    'k': 'king'
  };
  
  const imageName = `${color}_${pieceMap[pieceType]}`;
  
  try {
    const image = require(`../assets/pieces/${imageName}.png`);
    return <img src={image} alt={piece} className="chess-piece" />;
  } catch (e) {
    console.error(`Image non trouvée: ${imageName}`);
    return piece; // return character if image not found
  }
};

export default Piece;