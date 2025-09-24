import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Logo from './components/Logo';
import Game from './Game';
import Footer from './components/Footer';
import "./assets/styles.css";
import { ThemeProvider } from "./context/ThemeContext";

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root container not found');
}
const root = createRoot(container);
root.render(
  <StrictMode>
    <ThemeProvider>
      <Logo />
      <Game />
      <Footer />
    </ThemeProvider>
  </StrictMode>
);