import { addPoints, Point, substractPoints } from '../../../Point';
import Handle from '../helpers/Handle';
import { Command, LineToCommand, MoveToCommand } from '../Command';

abstract class MoveLineTo<T extends 'M' | 'L'> extends Command {
  constructor(relative: boolean, private command: T, private position: Point) {
    super(relative);
  }

  private get letter() {
    if (this.relative) {
      return this.command.toLowerCase();
    }

    return this.command;
  }

  toString() {
    return `${this.letter} ${this.position.x} ${this.position.y}`;
  }

  toJSON() {
    return [this.letter, this.position] as T extends 'M' ? MoveToCommand : LineToCommand;
  }

  getAbsolutePosition() {
    if (!this.relative || !this.prev) {
      return this.position;
    }

    return addPoints(this.prev.getAbsolutePosition(), this.position);
  }

  addHandles() {
    this.handles.push(new Handle(this.getAbsolutePosition(), this.onMove.bind(this)));
  }

  updateHandles() {
    this.handles[0].setPosition(this.getAbsolutePosition());
    this.next?.updateHandles();
  }

  onMove(position: Point, mouse: 'up' | 'move') {
    this.position = this.relative ? substractPoints(position, this.prev?.getAbsolutePosition()) : position;
    this.updateHandles();
    this.dispatchEvent(new CustomEvent('handleMove', { detail: { mouse } }));
  }
}

export class MoveTo extends MoveLineTo<'M'> {
  constructor(relative: boolean, position: Point) {
    super(relative, 'M', position);
  }
}

export class LineTo extends MoveLineTo<'L'> {
  constructor(relative: boolean, position: Point) {
    super(relative, 'L', position);
  }
}
