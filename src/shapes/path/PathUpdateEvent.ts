import { Point } from '../../Point';

type Detail = {
  mouse: 'move' | 'up';
  prevPosition: Point;
  nextPosition: Point;
};

export class PathUpdateEvent extends CustomEvent<Detail> {
  constructor(mouse: 'move' | 'up', prevPosition: Point, nextPosition: Point) {
    super('pathUpdate', { detail: { mouse, prevPosition, nextPosition } });
  }
}
