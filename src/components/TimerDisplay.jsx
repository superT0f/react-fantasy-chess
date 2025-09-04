export function TimerDisplay({ timeLeft, formatTime, player, active = false }) {
  return (
    <div className="timer-container">
      <div className={`timer ${player} ${active ? 'active' : ''}`}>
        Black: {formatTime(timeLeft.black)}
      </div>
    </div>
  );
}