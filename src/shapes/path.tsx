import React, { ReactElement, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Point } from '../Point';
import { updateShape } from '../slices/shape.slice';
import HandleComponent, { HandleProps, HandleRef } from './Handle';
import { v4 as uuid } from 'uuid';

import { Shape } from './shape';

const addPoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point = { x: 0, y: 0 }): Point => {
  return { x: x1 + x2, y: y1 + y2 };
};

const substractPoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point = { x: 0, y: 0 }): Point => {
  return { x: x1 - x2, y: y1 - y2 };
};

type MoveToCommand = ['M' | 'm', Point];
const isMoveTo = (command: CommandDef): command is MoveToCommand => command[0].toUpperCase() === 'M';

type LineToCommand = ['L' | 'l', Point];
const isLineTo = (command: CommandDef): command is LineToCommand => command[0].toUpperCase() === 'L';

type HorizontalLineCommand = ['H' | 'h', number];
const isHorizontalLine = (command: CommandDef): command is HorizontalLineCommand => command[0].toUpperCase() === 'H';

type VerticalLineCommand = ['V' | 'v', number];
const isVerticalLine = (command: CommandDef): command is VerticalLineCommand => command[0].toUpperCase() === 'V';

type CommandDef = MoveToCommand | LineToCommand | HorizontalLineCommand | VerticalLineCommand;
type CommandsDef = [MoveToCommand, ...CommandDef[]];

export type Path = Shape<'path'> & {
  commands: CommandsDef;
};

export const isPath = (shape: Shape<string>): shape is Path => shape.type === 'path';

class Handle {
  private id = uuid();

  private ref: HandleRef | null = null;
  public element: ReactElement;

  constructor(private position: Point, onMove: HandleProps['onMove']) {
    this.element = (
      <HandleComponent
        key={this.id}
        ref={(ref) => (this.ref = ref)}
        x={this.position.x}
        y={this.position.y}
        onMove={onMove}
      />
    );
  }

  setPosition(point: Point) {
    this.ref?.setPosition(point);
  }
}

abstract class Command extends EventTarget {
  public handles: Handle[] = [];

  public prev: Command | undefined;
  public next: Command | undefined;

  constructor(protected relative: boolean) {
    super();
  }

  abstract toString(): string;
  abstract toJSON(): CommandDef;

  abstract getRelativePosition(): Point;
  abstract getAbsolutePosition(): Point;

  abstract addHandles(): void;
  abstract updateHandles(): void;
}

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

  getRelativePosition() {
    if (this.relative || !this.prev) {
      return this.position;
    }

    return substractPoints(this.position ?? this.getAbsolutePosition(), this.prev.getAbsolutePosition());
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

class MoveTo extends MoveLineTo<'M'> {
  constructor(relative: boolean, position: Point) {
    super(relative, 'M', position);
  }
}

class LineTo extends MoveLineTo<'L'> {
  constructor(relative: boolean, position: Point) {
    super(relative, 'L', position);
  }
}

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

  getRelativePosition() {
    return { x: 0, y: 0 };
  }

  addHandles() {
    this.handles.push(new Handle(this.getAbsolutePosition(), this.onMove.bind(this)));
  }

  updateHandles() {
    this.handles[0].setPosition(this.getAbsolutePosition());
    this.next?.updateHandles();
  }

  onMove(_position: Point, mouse: 'up' | 'move') {
    this.updateHandles();
    this.dispatchEvent(new CustomEvent('handleMove', { detail: { mouse } }));
  }
}

class HorizontalLine extends StraightLine<'H'> {
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
    this.length = this.relative ? position.x - (this.prev?.getAbsolutePosition().x ?? 0) : position.x;
    super.onMove(position, mouse);
  }
}

class VerticalLine extends StraightLine<'V'> {
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
    this.length = this.relative ? position.y - (this.prev?.getAbsolutePosition().y ?? 0) : position.y;
    super.onMove(position, mouse);
  }
}

type PathCommand = MoveTo | LineTo | HorizontalLine | VerticalLine;

class PathCommands {
  private commands: [MoveTo, ...PathCommand[]];

  constructor(defs: CommandsDef, onHandleMove: (mouse: 'move' | 'up') => void) {
    this.commands = PathCommands.instanciateCommands(defs);

    for (const command of this.commands) {
      command.addEventListener('handleMove', ((e: CustomEvent<{ mouse: 'move' | 'up' }>) => {
        onHandleMove(e.detail.mouse);
      }) as EventListener);
    }
  }

  static instanciateCommands([first, ...rest]: CommandsDef): [MoveTo, ...PathCommand[]] {
    const isRelative = (def: CommandDef) => def[0].toLowerCase() === def[0];

    const instanciateCommand = (def: CommandDef): PathCommand => {
      const relative = isRelative(def);

      if (isMoveTo(def)) return new MoveTo(relative, def[1]);
      if (isLineTo(def)) return new LineTo(relative, def[1]);
      if (isHorizontalLine(def)) return new HorizontalLine(relative, def[1]);
      if (isVerticalLine(def)) return new VerticalLine(relative, def[1]);

      throw new Error();
    };

    const commands: [MoveTo, ...PathCommand[]] = [
      new MoveTo(isRelative(first), first[1]),
      ...rest.map(instanciateCommand),
    ];

    for (let i = 0; i < commands.length; ++i) {
      const command = commands[i];

      command.prev = commands[i - 1];
      command.next = commands[i + 1];

      command.addHandles();
    }

    return commands;
  }

  toString() {
    return this.commands.map((command) => command.toString()).join(' ');
  }

  toJSON(): CommandsDef {
    const [first, ...rest] = this.commands;

    return [first.toJSON(), ...rest.map((command) => command.toJSON())];
  }

  get handles() {
    return this.commands.map((command) => command.handles).flat();
  }
}

export const PathComponent: React.FC<Path> = (path) => {
  const { type: _, id, commands: _2, ...props } = path;
  const pathRef = useRef<SVGPathElement>(null);

  const dispatch = useDispatch();

  const onHandleMove = (mouse: 'up' | 'move') => {
    if (mouse === 'move') {
      pathRef.current?.setAttribute('d', commands.toString());
    } else {
      dispatch(updateShape({ id, commands: commands.toJSON() }));
    }
  };

  const commands = useMemo(() => new PathCommands(path.commands, onHandleMove), [path.commands]);

  return (
    <g key={id}>
      <path ref={pathRef} d={commands.toString()} {...props} />
      {commands.handles.map((handle) => handle.element)}
    </g>
  );
};
