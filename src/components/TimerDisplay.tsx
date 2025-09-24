import {Color} from 'chess.js';

interface TimerDisplayProps {
  timeLeft: number,
  formatTime: (time: number) => string;
  player: Color;
  active?: boolean;
}

export function TimerDisplay({ timeLeft, formatTime, player, active = false }: TimerDisplayProps) {
  return (
    <div className="timer-container">
      <div className={`timer ${player} ${active ? 'active' : ''}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}