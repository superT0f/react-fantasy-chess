import testUtils from 'react-dom/test-utils';
import { Chess } from 'chess.js';

test('validates moves using chess.js', () => {
  const chess = new Chess();
  expect(chess.move('e2e4')).toBeTruthy(); // Use chess.js validation
});