import { addPoints, Point, reflectPoint, substractPoints } from '../../../Point';
import { Command, CubicBezierCommand, SlopeCubicBezierCommand } from '../Command';
import { HandleMoveEvent } from '../HandleMoveEvent';

abstract class Bezier extends Command {
  protected initialEnd: Point;

  protected initialControl1: Point = { x: 0, y: 0 };
  protected initialControl2: Point = { x: 0, y: 0 };

  abstract get control1(): Point;
  abstract set control1(point: Point);

  abstract get control2(): Point;
  abstract set control2(point: Point);

  constructor(prev: Command, relative: boolean, public end: Point) {
    super(prev, relative);
    this.initialEnd = end;
  }

  get helpers(): { handles: Record<string, Point>; lines: Record<string, [Point, Point]> } {
    return {
      handles: {
        control1: this.absolute(this.control1),
        control2: this.absolute(this.control2),
        end: this.absolute(this.end),
      },
      lines: {
        control1: [this.prev!.absolute(this.prev!.end), this.absolute(this.control1)] as [Point, Point],
        control2: [this.absolute(this.end), this.absolute(this.control2)] as [Point, Point],
      },
    };
  }

  onHandleMove(vec: Point, handleName: string) {
    switch (handleName) {
      case 'control1':
        this.control1 = addPoints(this.initialControl1, vec);
        break;

      case 'control2':
        this.control2 = addPoints(this.initialControl2, vec);
        break;

      case 'end':
        this.end = addPoints(this.initialEnd, vec);
        this.control2 = addPoints(this.initialControl2, vec);
        break;
    }
  }

  onMount() {
    const onPrevHandleMove = (e: HandleMoveEvent) => {
      if (!this.relative) {
        this.control1 = addPoints(this.initialControl1, e.detail.vec);
      }
    };

    this.prev!.addEventListener('handleMove', onPrevHandleMove as EventListener);
    return () => this.prev!.removeEventListener('handleMove', onPrevHandleMove as EventListener);
  }
}

export class CubicBezier extends Bezier {
  static isCubicBezier(command: Command): command is CubicBezier {
    return command instanceof CubicBezier;
  }

  constructor(command: Command, relative: boolean, public control1: Point, public control2: Point, end: Point) {
    super(command, relative, end);
    this.initialControl1 = control1;
    this.initialControl2 = control2;
  }

  protected get letter() {
    return this.relative ? 'c' : 'C';
  }

  toString() {
    const { control1, control2, end } = this;

    return `${this.letter} ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`;
  }

  toJSON(): CubicBezierCommand {
    return [this.letter, this.control1, this.control2, this.end];
  }
}

export class SlopeCubicBezier extends Bezier {
  static isSlopeCubicBezier(command: Command): command is SlopeCubicBezier {
    return command instanceof SlopeCubicBezier;
  }

  constructor(command: Command, relative: boolean, public control2: Point, end: Point) {
    super(command, relative, end);
    this.initialControl2 = control2;
  }

  protected get letter() {
    return this.relative ? 's' : 'S';
  }

  toString() {
    const { control2, end } = this;

    return `${this.letter} ${control2.x} ${control2.y}, ${end.x} ${end.y}`;
  }

  toJSON(): SlopeCubicBezierCommand {
    return [this.letter, this.control2, this.end];
  }

  get control1(): Point {
    const prev = this.prev!;

    if (CubicBezier.isCubicBezier(prev) || SlopeCubicBezier.isSlopeCubicBezier(prev)) {
      const abs = this.prev!.absolute(reflectPoint(prev.control2, prev.end));

      if (!this.relative) {
        return abs;
      }

      return substractPoints(abs, this.prev!.absolute(this.prev!.end));
    }

    return prev.end;
  }

  set control1(_: Point) {}

  get helpers() {
    const helpers = super.helpers;
    const prev = this.prev!;

    if (!CubicBezier.isCubicBezier(prev) && !SlopeCubicBezier.isSlopeCubicBezier(prev)) {
      delete helpers.handles['control1'];
      delete helpers.lines['control1'];
    }

    return helpers;
  }

  onMount() {
    if (this.handles['control1']) {
      this.handles['control1'].draggable = false;
    }

    if (this.lines['control1']) {
      this.lines['control1'].draggable = false;
    }

    return super.onMount();
  }
}
