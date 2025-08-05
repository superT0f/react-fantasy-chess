import Entity from './Entity';

export class King extends Entity {
  isValidMove(to) {
    return false;
  }
}