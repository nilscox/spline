import { addPoints, Point, substractPoints } from '../../../Point';
import Handle from '../helpers/Handle';
import Line from '../helpers/Line';
import { Command, CubicBezierCommand } from '../Command';

export class CubicBezier extends Command {
  constructor(relative: boolean, private control1: Point, private control2: Point, private end: Point) {
    super(relative);
  }

  private get letter() {
    return this.relative ? 'c' : 'C';
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
    const { prev } = this;

    if (!prev) {
      throw new Error('prev should be defined');
    }

    this.handles.push(new Handle(this.getAbsolutePosition(this.control1), this.onMove('control1')));
    this.handles.push(new Handle(this.getAbsolutePosition(this.control2), this.onMove('control2')));
    this.handles.push(new Handle(this.getAbsolutePosition(), this.onMove('end')));

    this.lines.push(new Line(prev.getAbsolutePosition(), this.getAbsolutePosition(this.control1)));
    this.lines.push(new Line(this.getAbsolutePosition(this.control2), this.getAbsolutePosition()));
  }

  updateHandles() {
    const { prev } = this;

    if (!prev) {
      throw new Error('prev should be defined');
    }

    this.handles[0].setPosition(this.getAbsolutePosition(this.control1));
    this.handles[1].setPosition(this.getAbsolutePosition(this.control2));
    this.handles[2].setPosition(this.getAbsolutePosition());

    this.lines[0].setStart(prev.getAbsolutePosition());
    this.lines[0].setEnd(this.getAbsolutePosition(this.control1));

    this.lines[1].setStart(this.getAbsolutePosition(this.control2));
    this.lines[1].setEnd(this.getAbsolutePosition());
  }

  onMove(which: 'control1' | 'control2' | 'end') {
    return (position: Point, mouse: 'up' | 'move') => {
      const newPosition = this.relative ? substractPoints(position, this.prev?.getAbsolutePosition()) : position;

      if (which === 'control1') {
        this.control1 = newPosition;
      } else if (which === 'control2') {
        this.control2 = newPosition;
      } else {
        this.end = newPosition;
      }

      this.updateHandles();
      this.dispatchEvent(new CustomEvent('handleMove', { detail: { mouse } }));
    };
  }
}
