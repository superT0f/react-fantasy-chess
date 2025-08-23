import { useState, useEffect } from 'react';
import EntityUI from '../Entity';

export function PromotionModal({ color, onSelect, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const promotionPieces = ['q', 'r', 'b', 'n'];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSelection = (piece) => {
    onSelect(piece);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getSquarePosition = () => {
    const row = 4;
    const col = 4;
    return {
      top: `${row * 12.5}%`,
      left: `${col * 12.5}%`
    };
  };

  if (!isVisible) return null;

  return (
    <div className="promotion-modal-overlay" onClick={onClose}>
      <div 
        className="promotion-modal"
        style={getSquarePosition()}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Promote to:</h3>
        <div className="promotion-options">
          {promotionPieces.map(piece => (
            <button
              key={piece}
              className="promotion-option"
              onClick={() => handleSelection(piece)}
            >
              <EntityUI entity={color === 'white' ? piece.toUpperCase() : piece} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}