import Pawn from '../logic/Pawn';
import Referee from '../logic/Referee';
import testUtils from 'react-dom/test-utils';

test('validates black pawn moves correctly', () => {
  const referee = new Referee();
  const pawn_a7 = new Pawn(referee, 8);         //a7
  
  expect(pawn_a7.isValidMove(16)).toBe(true);   // a7 to a6
  expect(pawn_a7.isValidMove(24)).toBe(true);   // a7 to a5

  // others moves should not be valid
  expect(pawn_a7.isValidMove(32)).toBe(false);  // a7 to a4
  expect(pawn_a7.isValidMove(0)).toBe(false);   // a7 to a1
  expect(pawn_a7.isValidMove(42)).toBe(false);
});


test('validates white pawn moves correctly', () => {
  const referee = new Referee();
  const pawn_e2 = new Pawn(referee, 53);        // e2
  
  expect(pawn_e2.isValidMove(45)).toBe(true);   // e2 to a3
  expect(pawn_e2.isValidMove(37)).toBe(true);   // e2 to a4

  // others moves should not be valid
  expect(pawn_e2.isValidMove(29)).toBe(false);  // e2 to a5
  expect(pawn_e2.isValidMove(0)).toBe(false);  // e2 to a1
  expect(pawn_e2.isValidMove(42)).toBe(false);
});