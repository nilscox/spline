import { Point } from '../../Point';
import { PathUpdateEvent } from './PathUpdateEvent';
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

export type CommandDef =
  | MoveToCommand
  | LineToCommand
  | HorizontalLineCommand
  | VerticalLineCommand
  | CubicBezierCommand;

export type CommandsDef = [MoveToCommand, ...CommandDef[]];

export abstract class Command extends EventTarget {
  public handles: Handle[] = [];
  public lines: Line[] = [];

  public prev: Command | undefined;
  public next: Command | undefined;

  constructor(protected relative: boolean) {
    super();
  }

  abstract toString(): string;
  abstract toJSON(): CommandDef;

  abstract getAbsolutePosition(): Point;

  abstract addHandles(): void;
  abstract updateHandles(): void;

  protected performMutation(mouse: 'up' | 'move', perform: () => void) {
    const prev = this.getAbsolutePosition();

    perform();

    this.updateHandles();
    this.dispatchEvent(new PathUpdateEvent(mouse, prev, this.getAbsolutePosition()));
  }
}
