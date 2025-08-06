import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Logo from './components/Logo';
import Game from './Game';
import Footer from './components/Footer';
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Logo />
    <Game />
    <Footer />
  </StrictMode>
);