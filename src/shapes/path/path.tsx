import React, { useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { updateShape } from '../../slices/shape.slice';
import { Shape } from '../shape';
import { CommandsDef } from './Command';
import { PathCommands } from './PathCommands';

export type Path = Shape<'path'> & {
  commands: CommandsDef;
};

export const isPath = (shape: Shape<string>): shape is Path => shape.type === 'path';

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
      {commands.helpers.map(({ element }) => element)}
    </g>
  );
};
