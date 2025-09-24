import { Piece } from 'chess.js';
interface EntityUIProps {
  piece: Piece | undefined
};
const EntityUI = ({piece}:EntityUIProps) => {
  const theme = localStorage.getItem('chessTheme') || 'classic-improved';
  if (!piece) return null;

  const color = piece.color;
  const entityMap = {
    'p': 'pawn',
    'r': 'rook',
    'n': 'knight',
    'b': 'bishop',
    'q': 'queen',
    'k': 'king'
  };

  const imageName = `${color}_${entityMap[piece.type]}`;

  try {
    const image = require(`../../assets/themes/${theme}/${imageName}.png`);
    return <img src={image} alt={imageName} className="chess-entity" />;
  } catch (e) {
    console.error(`Image not found: ${imageName}.png in theme ${theme}`);
    // Return a fallback JSX element instead of a string
    return (
      <span className="chess-entity chess-entity--missing">
        {imageName.split('_').map(word => word.charAt(0).toUpperCase()).join('')}
      </span>
    );
  }
};

export default EntityUI;