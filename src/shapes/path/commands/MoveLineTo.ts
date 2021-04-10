import { addPoints, Point } from '../../../Point';
import { Command, LineToCommand, MoveToCommand } from '../Command';

abstract class MoveLineTo extends Command {
  protected initialTo: Point;

  constructor(prev: Command | undefined, relative: boolean, protected to: Point) {
    super(prev, relative);
    this.initialTo = to;
  }

  toString() {
    return `${this.letter} ${this.end.x} ${this.end.y}`;
  }

  get end() {
    return this.to;
  }

  get helpers() {
    return {
      handles: {
        end: this.absolute(this.end),
      },
    };
  }

  onHandleMove(vec: Point) {
    this.to = addPoints(this.initialTo, vec);
  }
}

export class MoveTo extends MoveLineTo {
  static isMoveTo(command: Command): command is MoveTo {
    return command instanceof MoveTo;
  }

  protected get letter() {
    return this.relative ? 'm' : 'M';
  }

  toJSON(): MoveToCommand {
    return [this.letter, this.end];
  }
}

export class LineTo extends MoveLineTo {
  static isLineTo(command: Command): command is LineTo {
    return command instanceof LineTo;
  }

  protected get letter() {
    return this.relative ? 'l' : 'L';
  }

  toJSON(): LineToCommand {
    return [this.letter, this.end];
  }
}
