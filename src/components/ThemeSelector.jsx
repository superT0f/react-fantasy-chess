import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const themes = ['classic', 'first-blood', 'hanna', 'mystical', 'mystical-hd'];

  return (
    <div className="theme-selector">
      <label>Theme:</label>
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        className="theme-dropdown"
      >
        {themes.map(t => (
          <option key={t} value={t}>
            {t.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;