import { Point } from '../../../Point';
import Handle from '../helpers/Handle';
import { Command, HorizontalLineCommand, VerticalLineCommand } from '../Command';

abstract class StraightLine<T extends 'H' | 'V'> extends Command {
  constructor(relative: boolean, protected command: T, protected length: number) {
    super(relative);
  }

  private get letter() {
    if (this.relative) {
      return this.command.toLowerCase();
    }

    return this.command;
  }

  toString() {
    return `${this.letter} ${this.length}`;
  }

  toJSON() {
    return [this.letter, this.length] as T extends 'H' ? HorizontalLineCommand : VerticalLineCommand;
  }

  abstract getAbsolutePositionFrom(point: Point): Point;

  getAbsolutePosition() {
    if (!this.prev) {
      throw new Error('prev should be defined');
    }

    return this.getAbsolutePositionFrom(this.prev.getAbsolutePosition());
  }

  abstract onMove(position: Point, mouse: 'up' | 'move'): void;

  addHandles() {
    this.handles.push(new Handle(this.getAbsolutePosition(), this.onMove.bind(this)));
  }

  updateHandles() {
    this.handles[0].setPosition(this.getAbsolutePosition());
    this.next?.updateHandles();
  }
}

export class HorizontalLine extends StraightLine<'H'> {
  constructor(relative: boolean, length: number) {
    super(relative, 'H', length);
  }

  getAbsolutePositionFrom(point: Point) {
    return {
      x: (this.relative ? point.x : 0) + this.length,
      y: point.y,
    };
  }

  onMove(position: Point, mouse: 'up' | 'move') {
    this.performMutation(mouse, () => {
      this.length = this.relative ? position.x - (this.prev?.getAbsolutePosition().x ?? 0) : position.x;
    });
  }
}

export class VerticalLine extends StraightLine<'V'> {
  constructor(relative: boolean, length: number) {
    super(relative, 'V', length);
  }

  getAbsolutePositionFrom(point: Point) {
    return {
      x: point.x,
      y: (this.relative ? point.y : 0) + this.length,
    };
  }

  onMove(position: Point, mouse: 'up' | 'move') {
    this.performMutation(mouse, () => {
      this.length = this.relative ? position.y - (this.prev?.getAbsolutePosition().y ?? 0) : position.y;
    });
  }
}
