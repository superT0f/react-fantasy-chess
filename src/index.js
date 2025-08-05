import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Logo from './components/Logo';
import "./styles.css";

import Game from './Game';

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Logo />
    <Game />
  </StrictMode>
);