const Logo = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: "'Cinzel', serif",
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#d4af37',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      margin: '20px 0',
      padding: '10px',
      borderRadius: '15px',
      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
{/* Texte avec effet de relief */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <span style={{ 
          position: 'relative',
          letterSpacing: '100px'
        }}>
          FANTASY CHESS
        </span>
      </div>
      
      {/* Pièces d'échecs décoratives */}
      <div style={{
        position: 'absolute',
        bottom: '-15px',
        left: '20%',
        width: '30px',
        height: '30px',
        background: 'radial-gradient(circle at 30% 30%, #fff, #aaa)',
        borderRadius: '50%',
        border: '1px solid #d4af37',
        boxShadow: '0 0 8px rgba(212, 175, 55, 0.7)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-15px',
        right: '20%',
        width: '30px',
        height: '30px',
        background: 'radial-gradient(circle at 30% 30%, #333, #000)',
        borderRadius: '50%',
        border: '2px solid #d4af37',
        boxShadow: '0 0 8px rgba(212, 175, 55, 0.7)'
      }}></div>
    </div>
  );
};

export default Logo;