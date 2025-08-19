import ThemeSelector from './ThemeSelector';
export function TimerDisplay({ timeLeft, formatTime, currentPlayer }) {

    return (<div className="timer-container">
        <div className={`timer white ${currentPlayer === 'white' ? 'active' : ''}`}>
            White: {formatTime(timeLeft.white)}
        </div>
        <div className={`timer black ${currentPlayer === 'black' ? 'active' : ''}`}>
            Black: {formatTime(timeLeft.black)}
        </div>
        <ThemeSelector />
    </div>);
}
