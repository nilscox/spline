import { addPoints, Point } from '../../Point';
import { HandleMoveEvent } from './HandleMoveEvent';
import Handle from './helpers/Handle';
import Line from './helpers/Line';

export type MoveToCommand = ['M' | 'm', Point];
export const isMoveTo = (command: CommandDef): command is MoveToCommand => {
  return command[0].toUpperCase() === 'M';
};

export type LineToCommand = ['L' | 'l', Point];
export const isLineTo = (command: CommandDef): command is LineToCommand => {
  return command[0].toUpperCase() === 'L';
};

export type HorizontalLineCommand = ['H' | 'h', number];
export const isHorizontalLine = (command: CommandDef): command is HorizontalLineCommand => {
  return command[0].toUpperCase() === 'H';
};

export type VerticalLineCommand = ['V' | 'v', number];
export const isVerticalLine = (command: CommandDef): command is VerticalLineCommand => {
  return command[0].toUpperCase() === 'V';
};

export type CubicBezierCommand = ['C' | 'c', Point, Point, Point];
export const isCubicBezier = (command: CommandDef): command is CubicBezierCommand => {
  return command[0].toUpperCase() === 'C';
};

export type SlopeCubicBezierCommand = ['S' | 's', Point, Point];
export const isSlopeCubicBezier = (command: CommandDef): command is SlopeCubicBezierCommand => {
  return command[0].toUpperCase() === 'S';
};

export type CommandDef =
  | MoveToCommand
  | LineToCommand
  | HorizontalLineCommand
  | VerticalLineCommand
  | CubicBezierCommand
  | SlopeCubicBezierCommand;

export type CommandsDef = [MoveToCommand, ...CommandDef[]];

export abstract class Command extends EventTarget {
  public handles: Record<string, Handle> = {};
  public lines: Line[] = [];

  constructor(protected prev: Command | undefined, protected relative: boolean) {
    super();
  }

  protected abstract get letter(): CommandDef[0];

  abstract toString(): string;
  abstract toJSON(): CommandDef;

  abstract get end(): Point;
  abstract get helpers(): { handles: Record<string, Point>; lines?: Array<[Point, Point]> };

  abstract onHandleMove(point: Point, handleName: string): void;

  onMount(): (() => void) | void {}

  absolute(point: Point): Point {
    return this.relative ? addPoints(point, this.prev?.absolute(this.prev?.end)) : point;
  }

  createHelpers() {
    const { handles, lines = [] } = this.helpers;

    const onHandleMove = (handleName: string) => (vec: Point, mouse: 'move' | 'up') => {
      this.onHandleMove(vec, handleName);
      this.dispatchEvent(new HandleMoveEvent(vec, mouse));
    };

    for (const [name, position] of Object.entries(handles)) {
      this.handles[name] = new Handle(position, onHandleMove(name));
    }

    for (const [start, end] of lines) {
      this.lines.push(new Line(start, end));
    }
  }

  updateHelpers() {
    const { handles, lines = [] } = this.helpers;

    for (const [name, position] of Object.entries(handles)) {
      this.handles[name].setPosition(position);
    }

    for (const [i, [start, end]] of Object.entries(lines)) {
      this.lines[Number(i)].setStart(start);
      this.lines[Number(i)].setEnd(end);
    }
  }
}
