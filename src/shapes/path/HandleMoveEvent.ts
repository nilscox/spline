import { Point } from '../../Point';

type Detail = {
  vec: Point;
  mouse: 'move' | 'up';
};

export class HandleMoveEvent extends CustomEvent<Detail> {
  constructor(vec: Point, mouse: 'move' | 'up') {
    super('handleMove', { detail: { vec, mouse } });
  }
}
