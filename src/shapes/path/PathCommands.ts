import { MoveTo, LineTo } from './commands/MoveLineTo';
import { HorizontalLine, VerticalLine } from './commands/StraightLine';
import { CubicBezier } from './commands/CubicBezier';
// prettier-ignore
import { CommandDef, CommandsDef, isCubicBezier, isHorizontalLine, isLineTo, isMoveTo, isVerticalLine } from './Command';
import { PathUpdateEvent } from './PathUpdateEvent';

export type PathCommand = MoveTo | LineTo | HorizontalLine | VerticalLine | CubicBezier;

export class PathCommands {
  private commands: [MoveTo, ...PathCommand[]];

  constructor(defs: CommandsDef, onUpdate: (mouse: 'move' | 'up') => void) {
    this.commands = PathCommands.instanciateCommands(defs);

    for (const command of this.commands) {
      command.addEventListener('pathUpdate', ((e: PathUpdateEvent) => {
        onUpdate(e.detail.mouse);
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
      if (isCubicBezier(def)) return new CubicBezier(relative, def[1], def[2], def[3]);

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

  get helpers() {
    return this.commands.map((command) => [...command.handles, ...command.lines]).flat();
  }
}
