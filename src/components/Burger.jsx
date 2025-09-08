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
                    <button className="play-again" onClick={() => window.location.href = '/'}>
                        HOME
                    </button>
                </div>
            )}
        </>);
}

export default Burger;
