export function Graveyard({ captured, player, graveDiff }) {
  const eValues = {
    'p': 1, 'P': 1,
    'n': 3, 'N': 3,
    'b': 3, 'B': 3,
    'r': 5, 'R': 5,
    'q': 10, 'Q': 10
  };

  const symbols = {
    'p': '♟', 'P': '♙',
    'n': '♞', 'N': '♘',
    'b': '♝', 'B': '♗',
    'r': '♜', 'R': '♖',
    'q': '♛', 'Q': '♕'
  };

  const total = captured.reduce((sum, piece) => sum + (eValues[piece] || 0), 0);

  return (
    <div className={`graveyard graveyard-${player}`}>
      <div className="graveyard-header">
        <h3>{player}</h3>
        {graveDiff > 0 && (
          <div className="graveDiff">+{graveDiff}</div>
        )}
      </div>
      <div className="captured">
        {captured.map((piece, index) => (
          <span key={index} className="captured" title={`Valeur: ${eValues[piece] || 0}`}>
            {symbols[piece] || piece}
          </span>
        ))}
      </div>
      <div className="total-points">{total} points</div>
    </div>
  );
}