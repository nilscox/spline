import { Point } from '../../../Point';
import { Command, HorizontalLineCommand, VerticalLineCommand } from '../Command';

abstract class StraightLine extends Command {
  protected initialLength: number;

  constructor(prev: Command, relative: boolean, protected length: number) {
    super(prev, relative);
    this.initialLength = length;
  }

  toString() {
    return `${this.letter} ${this.length}`;
  }

  toJSON(): HorizontalLineCommand | VerticalLineCommand {
    return [this.letter as 'H' | 'h' | 'V' | 'v', this.length];
  }

  get helpers() {
    return {
      handles: {
        end: this.absolute(this.end),
      },
    };
  }
}

export class HorizontalLine extends StraightLine {
  constructor(prev: Command, relative: boolean, length: number) {
    super(prev, relative, length);
  }

  protected get letter() {
    return this.relative ? 'h' : 'H';
  }

  get end() {
    return {
      x: this.length,
      y: this.relative ? 0 : this.prev!.absolute(this.prev!.end).y,
    };
  }

  onHandleMove(vec: Point) {
    this.length = this.initialLength + vec.x;
  }
}

export class VerticalLine extends StraightLine {
  constructor(command: Command, relative: boolean, length: number) {
    super(command, relative, length);
  }

  protected get letter() {
    return this.relative ? 'v' : 'V';
  }

  get end() {
    return {
      x: this.relative ? 0 : this.prev!.absolute(this.prev!.end).x,
      y: this.length,
    };
  }

  onHandleMove(vec: Point) {
    this.length = this.initialLength + vec.y;
  }
}
