import { addPoints, Point } from '../../Point';
import { HandleMoveEvent } from './HandleMoveEvent';
import Handle from './helpers/Handle';
import Line from './helpers/Line';

const commandTypeGuard = (upperLetter: string, length: number, command: Array<string | number | Point>) => {
  return command[0].toString().toUpperCase() === upperLetter && command.length === length;
};

export type MoveToCommand = ['M' | 'm', Point];
export const isMoveTo = (command: Array<string | number | Point>): command is MoveToCommand => {
  return commandTypeGuard('M', 2, command);
};

export type LineToCommand = ['L' | 'l', Point];
export const isLineTo = (command: Array<string | number | Point>): command is LineToCommand => {
  return commandTypeGuard('L', 2, command);
};

export type HorizontalLineCommand = ['H' | 'h', number];
export const isHorizontalLine = (command: Array<string | number | Point>): command is HorizontalLineCommand => {
  return commandTypeGuard('H', 2, command);
};

export type VerticalLineCommand = ['V' | 'v', number];
export const isVerticalLine = (command: Array<string | number | Point>): command is VerticalLineCommand => {
  return commandTypeGuard('V', 2, command);
};

export type CubicBezierCommand = ['C' | 'c', Point, Point, Point];
export const isCubicBezier = (command: Array<string | number | Point>): command is CubicBezierCommand => {
  return commandTypeGuard('C', 4, command);
};

export type SlopeCubicBezierCommand = ['S' | 's', Point, Point];
export const isSlopeCubicBezier = (command: Array<string | number | Point>): command is SlopeCubicBezierCommand => {
  return commandTypeGuard('S', 3, command);
};

export type ClosePathCommand = ['Z' | 'z'];
export const isClosePath = (command: Array<string | number | Point>): command is ClosePathCommand => {
  return commandTypeGuard('Z', 1, command);
};

export const isCommand = (command: Array<string | number | Point>): command is CommandDef => {
  return [
    isMoveTo,
    isLineTo,
    isHorizontalLine,
    isVerticalLine,
    isCubicBezier,
    isSlopeCubicBezier,
    isClosePath,
  ].some((f) => f(command));
};

export type CommandDef =
  | MoveToCommand
  | LineToCommand
  | HorizontalLineCommand
  | VerticalLineCommand
  | CubicBezierCommand
  | SlopeCubicBezierCommand
  | ClosePathCommand;

export type CommandsDef = [MoveToCommand, ...CommandDef[]];

export abstract class Command extends EventTarget {
  public handles: Record<string, Handle> = {};
  public lines: Record<string, Line> = {};

  constructor(protected prev: Command | undefined, protected relative: boolean) {
    super();
  }

  protected abstract get letter(): CommandDef[0];

  abstract toString(): string;
  abstract toJSON(): CommandDef;

  abstract get end(): Point;
  abstract get helpers(): { handles?: Record<string, Point>; lines?: Record<string, [Point, Point]> };

  abstract onHandleMove(point: Point, handleName: string): void;

  onMount(): (() => void) | void {}

  absolute(point: Point): Point {
    return this.relative ? addPoints(point, this.prev?.absolute(this.prev?.end)) : point;
  }

  createHelpers() {
    const { handles = {}, lines = {} } = this.helpers;

    const onHandleMove = (handleName: string) => (vec: Point, mouse: 'move' | 'up') => {
      this.onHandleMove(vec, handleName);
      this.dispatchEvent(new HandleMoveEvent(vec, mouse));
    };

    for (const [name, position] of Object.entries(handles)) {
      this.handles[name] = new Handle(position, onHandleMove(name));
    }

    for (const [name, [start, end]] of Object.entries(lines)) {
      this.lines[name] = new Line(start, end);
    }
  }

  updateHelpers() {
    const { handles = {}, lines = {} } = this.helpers;

    for (const [name, position] of Object.entries(handles)) {
      this.handles[name].setPosition(position);
    }

    for (const [name, [start, end]] of Object.entries(lines)) {
      this.lines[name].setStart(start);
      this.lines[name].setEnd(end);
    }
  }
}
