import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Logo from './components/Logo';
import Game from './Game';
import Footer from './components/Footer';
import "./styles.css";
import { ThemeProvider } from "./context/ThemeContext";
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ThemeProvider>
      <Logo />
      <Game />
      <Footer />
    </ThemeProvider>
  </StrictMode>
);