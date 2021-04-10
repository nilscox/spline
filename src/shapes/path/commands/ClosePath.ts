import { ClosePathCommand, Command } from '../Command';

export class ClosePath extends Command {
  constructor(prev: Command | undefined, relative: boolean) {
    super(prev, relative);
  }

  protected get letter() {
    return this.relative ? 'z' : 'Z';
  }

  toJSON(): ClosePathCommand {
    return [this.letter];
  }

  toString() {
    return this.letter;
  }

  get end() {
    return this.prev!.end;
  }

  get helpers() {
    return {};
  }

  onHandleMove() {}
}
