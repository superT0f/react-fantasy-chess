export function Graveyard({ captured, player, graveDiff, timeLeft, formatTime, active }) {
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

  // Count pieces by type
  const pieceCounts = captured.reduce((counts, piece) => {
    counts[piece] = (counts[piece] || 0) + 1;
    return counts;
  }, {});

  // Group pieces with counts and sort by value (highest first)
  const groupedPieces = Object.entries(pieceCounts)
    .map(([piece, count]) => ({
      piece,
      count,
      value: eValues[piece] || 0
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const total = captured.reduce((sum, piece) => sum + (eValues[piece] || 0), 0);

  return (
    <div className={`graveyard graveyard-${player}`}>
      <div className="graveyard-header">
        <h3>{player} : </h3>
        <div className={`timer ${player} ${active ? 'active' : ''}`}>
        {formatTime(timeLeft[player])}
        </div>
        {graveDiff > 0 && (
          <div className="graveDiff">+{graveDiff}</div>
        )}
      </div>
      <div className="captured-pieces">
        {groupedPieces.map(({ piece, count, value }, index) => (
          <div key={index} className="captured-piece-group" title={`${count} ${piece.toLowerCase() === 'p' ? 'Pawns' : piece}, Value: ${value * count}`}>
            <span className="piece-symbol">{symbols[piece] || piece}</span>
            {count > 1 && <span className="piece-count">×{count}</span>}
          </div>
        ))}
      </div>
      <div className="total-points">{total} points</div>
    </div>
  );
}