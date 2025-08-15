# Fantasy Chess - React Implementation

![Fantasy Chess Screenshot](./screens/screenshot-2025-08-15.png)

A modern chess game implementation built with React, featuring classic chess rules with visual enhancements.

## Features

- Classic chess rules implementation
- Interactive board with move highlighting
- Move history with PGN notation
- Responsive design
- Fantasy-themed visual styling

## Project Structure
```
├── public/index.html       # Main HTML template
├── src/
│ ├── assets/               # Game assets
│ ├── components/           # React jsx
│ ├── logic/                # Game logic
│ │ ├── BaseEntity.js       # Base chess class
│ │ ├── Entity.js           # factory + utilities
│ │ ├── pieces/             # Individual piece implementations
│ │ ├── Pawn.js             # Pawn implementation
│ │ └── PgnNotation.js      # Move notation handling
│ ├── Board.js              # Chess board component
│ ├── Game.js               # Main game logic component
│ ├── Square.js             # square component
│ ├── styles.css            # Global styles
│ └── index.js              # entry point
├── Makefile                # Build automation
├── package.json            # dependencies
└── README.md # This file
```




## Key Files

- **Board.js**: Handles the chess board rendering and move validation
- **Game.js**: Manages game state and history
- **Entity.js**: Factory for creating chess pieces with proper movement rules
- **PgnNotation.js**: Converts moves to standard chess notation
- **styles.css**: Custom styling for the chess interface

## Installation

1. Clone the repository:
   ```bash
   git clone https://gitlab.com/SuperT0f/react-fantasy-chess.git
   ```
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
make dev
```

4. Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Runs the test suite

## Live Demo
Play the game online: [Fantasy Chess Demo](https://fantasy-chess.prigent.site/play/)

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the [GNU GPL V3](./LICENCE.md) License.