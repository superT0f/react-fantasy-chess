const Entity = ({ entity }) => {
  if (!entity) return null;
  
  const color = entity === entity.toUpperCase() ? 'w' : 'b';
  const entityType = entity.toLowerCase();
  const entityMap = {
    'p': 'pawn',
    'r': 'rook',
    'n': 'knight',
    'b': 'bishop',
    'q': 'queen',
    'k': 'king'
  };
  
  const imageName = `${color}_${entityMap[entityType]}`;
  
  try {
    const image = require(`../assets/pieces/${imageName}.png`);
    return <img src={image} alt={entity} className="chess-entity" />;
  } catch (e) {
    console.error(`Image not found: ${imageName}`);
    return entity;
  }
};

export default Entity;