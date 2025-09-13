import { useState } from 'react';
import ThemeSelector from './ThemeSelector';

const Burger = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <><button
            className={`burger-button ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="open burger">
            <span></span>
            <span></span>
            <span></span>
        </button>
            {isMenuOpen && (
                <div className="menu-dropdown">
                    <ThemeSelector />
                    <div className="separator" />
                    <br />
                    <button className="back-btn " onClick={() => {
                        if (confirm('Are you sure you want to leave the game? Your current game progress will be lost.'))
                        window.location.href = '/'}}>
                        &larr; Back to Home page
                    </button>
                    <div className="separator" />
                    <br />
                    <button
                        className="back-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="open burger">X Close this menu</button>
                </div>
            )}
        </>);
}

export default Burger;
