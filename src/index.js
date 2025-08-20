import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Logo from './components/Logo';
import Game from './Game';
import Footer from './components/Footer';
import "./assets/styles.css";
import { ThemeProvider } from "./context/ThemeContext";
import Burger from './components/Burger';

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ThemeProvider>
      <Logo />
      <Burger />
      <Game />
      <Footer />
    </ThemeProvider>
  </StrictMode>
);