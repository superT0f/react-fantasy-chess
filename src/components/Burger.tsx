import { useState } from 'react';
import ThemeSelector from './ThemeSelector';

interface BurgerProps {
    setShowAuthModal: Function
}
const Burger = ({ setShowAuthModal }: BurgerProps) => {
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
                    <button
                        className="close-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="open burger">x</button>

                    <div className="separator" />
                    <br />
                    <ThemeSelector />
                    <div className="separator" />
                    <br />
                    <div className="auth-prompt">
                        <button
                            className="login-btn"
                            onClick={() => setShowAuthModal(true)}
                        >
                            Login / Register
                        </button>
                    </div>

                </div>
            )}
        </>);
}

export default Burger;
