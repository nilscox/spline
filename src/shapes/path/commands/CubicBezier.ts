import { addPoints, Point, reflectPoint, substractPoints } from '../../../Point';
import Handle, { HandleProps } from '../helpers/Handle';
import Line from '../helpers/Line';
import { Command, CubicBezierCommand, SlopeCubicBezierCommand } from '../Command';
import { PathUpdateEvent } from '../PathUpdateEvent';

export class CubicBezier extends Command {
  constructor(relative: boolean, public control1: Point, public control2: Point, private end: Point) {
    super(relative);
  }

  private get letter() {
    return this.relative ? 'c' : 'C';
  }

  static isCubicBezier(command: Command): command is CubicBezier {
    return command instanceof CubicBezier;
  }

  toString() {
    const { control1, control2, end } = this;

    return `${this.letter} ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`;
  }

  toJSON(): CubicBezierCommand {
    return [this.letter, this.control1, this.control2, this.end];
  }

  getAbsolutePosition(point = this.end) {
    if (!this.relative || !this.prev) {
      return point;
    }

    return addPoints(this.prev.getAbsolutePosition(), point);
  }

  addHandles() {
    this.handles.push(new Handle(this.getAbsolutePosition(this.control1), this.onMove('control1')));
    this.handles.push(new Handle(this.getAbsolutePosition(this.control2), this.onMove('control2')));
    this.handles.push(new Handle(this.getAbsolutePosition(), this.onMove('end')));

    this.lines.push(new Line(this.prev!.getAbsolutePosition(), this.getAbsolutePosition(this.control1)));
    this.lines.push(new Line(this.getAbsolutePosition(), this.getAbsolutePosition(this.control2)));

    // TODO: remove event listener
    this.prev!.addEventListener('pathUpdate', ((e: PathUpdateEvent) => {
      if (this.relative) {
        return;
      }

      const vec = substractPoints(this.control1, e.detail.prevPosition);
      this.control1 = addPoints(e.detail.nextPosition, vec);
    }) as EventListener);
  }

  updateHandles() {
    this.handles[0].setPosition(this.getAbsolutePosition(this.control1));
    this.handles[1].setPosition(this.getAbsolutePosition(this.control2));
    this.handles[2].setPosition(this.getAbsolutePosition());

    this.lines[0].setStart(this.prev!.getAbsolutePosition());
    this.lines[0].setEnd(this.getAbsolutePosition(this.control1));

    this.lines[1].setStart(this.getAbsolutePosition());
    this.lines[1].setEnd(this.getAbsolutePosition(this.control2));

    this.next?.updateHandles();
  }

  onMove(which: 'control1' | 'control2' | 'end'): HandleProps['onMove'] {
    const mutate = (position: Point) => {
      const newPosition = this.relative ? substractPoints(position, this.prev?.getAbsolutePosition()) : position;

      switch (which) {
        case 'control1':
          this.control1 = newPosition;
          break;

        case 'control2':
          this.control2 = newPosition;
          break;

        case 'end':
          const vec = substractPoints(this.control2, this.end);

          this.end = newPosition;
          this.control2 = addPoints(this.end, vec);
          break;
      }
    };

    return (position: Point, mouse: 'up' | 'move') => {
      this.performMutation(mouse, () => mutate(position));
    };
  }
}

export class SlopeCubicBezier extends Command {
  constructor(relative: boolean, private control: Point, private end: Point) {
    super(relative);
  }

  private get letter() {
    return this.relative ? 's' : 'S';
  }

  static isSlopeCubicBezier(command: Command): command is SlopeCubicBezier {
    return command instanceof SlopeCubicBezier;
  }

  toString() {
    const { control, end } = this;

    return `${this.letter} ${control.x} ${control.y}, ${end.x} ${end.y}`;
  }

  toJSON(): SlopeCubicBezierCommand {
    return [this.letter, this.control, this.end];
  }

  getAbsolutePosition(point = this.end) {
    if (!this.relative || !this.prev) {
      return point;
    }

    return addPoints(this.prev.getAbsolutePosition(), point);
  }

  getReflectedControlPosition() {
    const prev = this.prev!;

    if (SlopeCubicBezier.isSlopeCubicBezier(prev)) {
      return reflectPoint(prev.getAbsolutePosition(prev.control), prev.getAbsolutePosition());
    }

    if (CubicBezier.isCubicBezier(prev)) {
      return reflectPoint(prev.getAbsolutePosition(prev.control2), prev.getAbsolutePosition());
    }

    return prev.getAbsolutePosition();
  }

  addHandles() {
    this.handles.push(new Handle(this.getAbsolutePosition(this.control), this.onMove('control')));
    this.handles.push(new Handle(this.getAbsolutePosition(), this.onMove('end')));
    this.handles.push(new Handle(this.getReflectedControlPosition(), undefined, true));

    this.lines.push(new Line(this.prev!.getAbsolutePosition(), this.getReflectedControlPosition(), true));
    this.lines.push(new Line(this.getAbsolutePosition(), this.getAbsolutePosition(this.control)));
  }

  updateHandles() {
    this.handles[0].setPosition(this.getAbsolutePosition(this.control));
    this.handles[1].setPosition(this.getAbsolutePosition());
    this.handles[2].setPosition(this.getReflectedControlPosition());

    this.lines[0].setStart(this.prev!.getAbsolutePosition());
    this.lines[0].setEnd(this.getReflectedControlPosition());

    this.lines[1].setStart(this.getAbsolutePosition());
    this.lines[1].setEnd(this.getAbsolutePosition(this.control));

    this.next?.updateHandles();
  }

  onMove(which: 'control' | 'end'): HandleProps['onMove'] {
    const mutate = (position: Point) => {
      const newPosition = this.relative ? substractPoints(position, this.prev?.getAbsolutePosition()) : position;

      switch (which) {
        case 'control':
          this.control = newPosition;
          break;

        case 'end':
          const vec = substractPoints(this.control, this.end);

          this.end = newPosition;
          this.control = addPoints(this.end, vec);
          break;
      }
    };

    return (position: Point, mouse: 'up' | 'move') => {
      this.performMutation(mouse, () => mutate(position));
    };
  }
}
