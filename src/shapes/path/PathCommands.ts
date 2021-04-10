import { MoveTo, LineTo } from './commands/MoveLineTo';
import { HorizontalLine, VerticalLine } from './commands/StraightLine';
import { CubicBezier, SlopeCubicBezier } from './commands/CubicBezier';
import { HandleMoveEvent } from './HandleMoveEvent';
import { ClosePath } from './commands/ClosePath';
import {
  Command,
  CommandDef,
  CommandsDef,
  isClosePath,
  isCubicBezier,
  isHorizontalLine,
  isLineTo,
  isMoveTo,
  isSlopeCubicBezier,
  isVerticalLine,
} from './Command';

export type PathCommand = MoveTo | LineTo | HorizontalLine | VerticalLine | CubicBezier | SlopeCubicBezier | ClosePath;

export class PathCommands {
  private commands: [MoveTo, ...PathCommand[]];

  constructor(defs: CommandsDef, onUpdate: (mouse: 'move' | 'up') => void) {
    this.commands = PathCommands.instanciateCommands(defs);

    const onCommandUpdated = ((e: HandleMoveEvent) => {
      this.commands.forEach((command) => {
        command.updateHelpers();
      });

      onUpdate(e.detail.mouse);
    }) as EventListener;

    for (const command of this.commands) {
      command.addEventListener('handleMove', onCommandUpdated);
    }
  }

  static instanciateCommands([first, ...rest]: CommandsDef): [MoveTo, ...PathCommand[]] {
    const isRelative = (def: CommandDef) => def[0].toLowerCase() === def[0];

    const instanciateCommand = (def: CommandDef): PathCommand => {
      const relative = isRelative(def);

      if (isMoveTo(def)) return new MoveTo(prev, relative, def[1]);
      if (isLineTo(def)) return new LineTo(prev, relative, def[1]);
      if (isHorizontalLine(def)) return new HorizontalLine(prev, relative, def[1]);
      if (isVerticalLine(def)) return new VerticalLine(prev, relative, def[1]);
      if (isCubicBezier(def)) return new CubicBezier(prev, relative, def[1], def[2], def[3]);
      if (isSlopeCubicBezier(def)) return new SlopeCubicBezier(prev, relative, def[1], def[2]);
      if (isClosePath(def)) return new ClosePath(prev, relative);

      throw new Error();
    };

    let prev: Command = new MoveTo(undefined, isRelative(first), first[1]);

    const commands: [MoveTo, ...PathCommand[]] = [
      prev as MoveTo,
      ...rest.map((def) => (prev = instanciateCommand(def))),
    ];

    for (const command of commands) {
      command.createHelpers();
    }

    return commands;
  }

  onMount() {
    const onUnmounts = this.commands.map((command) => command.onMount());
    return () => void onUnmounts.map((onUnmount) => onUnmount && onUnmount());
  }

  toString() {
    return this.commands.map((command) => command.toString()).join(' ');
  }

  toJSON(): CommandsDef {
    const [first, ...rest] = this.commands;
    return [first.toJSON(), ...rest.map((command) => command.toJSON())];
  }

  get helpers() {
    return this.commands.map((command) => [...Object.values(command.handles), ...Object.values(command.lines)]).flat();
  }
}
