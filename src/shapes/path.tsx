import produce from 'immer';
import React, { forwardRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateShape } from '../slices/shape.slice';
import useHelperStrokeWidth from '../useHelperStrokeWidth';
import useTranslation from '../useTranslation';

import { Shape } from './shape';

type Point = {
  x: number;
  y: number;
};

export const isPoint = (p: any): p is Point => {
  return typeof p?.x === 'number' && typeof p?.y === 'number';
};

type MoveToCommand = ['M', Point];
const isMoveTo = (command: PathCommand): command is MoveToCommand => command[0] === 'M';

type LineToCommand = ['L', Point];
const isLineTo = (command: PathCommand): command is LineToCommand => command[0] === 'L';

type HorizontalLineCommand = ['H', number];
const isHorizontalLine = (command: PathCommand): command is HorizontalLineCommand => command[0] === 'H';

type VerticalLineCommand = ['V', number];
const isVerticalLine = (command: PathCommand): command is VerticalLineCommand => command[0] === 'V';

type ClosePathCommand = ['Z'];
const isClosePath = (command: PathCommand): command is ClosePathCommand => command[0] === 'Z';

type CubicBezierCommand = ['C', Point, Point, Point];
const isCubicBezier = (command: PathCommand): command is CubicBezierCommand => command[0] === 'C';

type PathCommand =
  | MoveToCommand
  | LineToCommand
  | HorizontalLineCommand
  | VerticalLineCommand
  | ClosePathCommand
  | CubicBezierCommand;

type PathCommands = [MoveToCommand, ...PathCommand[]];

export type Path = Shape<'path'> & {
  commands: PathCommands;
};

export const isPath = (shape: Shape<string>): shape is Path => shape.type === 'path';

type HandleProps = {
  x: number;
  y: number;
  startPoint?: Point;
  onMove: (p: { x: number; y: number }, mouse: 'up' | 'move') => void;
};

type HandleRef = {
  setStartPoint: (point: Point) => void;
  move: (point: Point) => void;
};

const Handle = forwardRef<HandleRef, HandleProps>(({ x, y, startPoint, onMove }, ref) => {
  const strokeWidth = useHelperStrokeWidth();
  const size = strokeWidth * 15;
  const lineRef = useRef<SVGLineElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  const translateHandlers = useTranslation(onMove);

  useImperativeHandle(ref, () => ({
    setStartPoint: ({ x, y }: Point) => {
      lineRef.current?.setAttribute('x1', `${x}`);
      lineRef.current?.setAttribute('y1', `${y}`);
    },
    move: ({ x, y }: Point) => {
      lineRef.current?.setAttribute('x2', `${x}`);
      lineRef.current?.setAttribute('y2', `${y}`);
      rectRef.current?.setAttribute('transform', `translate(${x}, ${y})`);
    },
  }));

  return (
    <>
      {startPoint && (
        <line ref={lineRef} x1={startPoint.x} y1={startPoint.y} x2={x} y2={y} stroke="#CCC" strokeWidth={strokeWidth} />
      )}
      <rect
        ref={rectRef}
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        fill="#CCC6"
        stroke="#CCC"
        strokeWidth={strokeWidth}
        transform={`translate(${x}, ${y})`}
        {...translateHandlers}
      />
    </>
  );
});

const stringifyCommand = (command: PathCommand) => {
  if (isMoveTo(command) || isLineTo(command)) {
    return `${command[0]} ${command[1].x} ${command[1].y}`;
  }

  if (isHorizontalLine(command) || isVerticalLine(command)) {
    return `${command[0]} ${command[1]}`;
  }

  if (isClosePath(command)) {
    return 'Z';
  }

  if (isCubicBezier(command)) {
    const [_, ...args] = command;

    return `C ${args.map(({ x, y }) => `${x} ${y}`).join(', ')}`;
  }
};

const stringifyCommands = (commands: PathCommand[]) => {
  return commands.map(stringifyCommand).join(' ');
};

const updatePathValue = (command: PathCommand, argIndex: number, a: number, b?: number) => {
  const arg = command[argIndex + 1] as Point | number;

  if (typeof arg === 'number') {
    (command[argIndex + 1] as number) += a;
  }

  if (isPoint(arg) && b !== undefined) {
    arg.x += a;
    arg.y += b;
  }
};

const processHandleMove = (commands: PathCommands, commandIndex: number, argIndex: number, p: Point) => {
  const command = commands[commandIndex];

  if (isMoveTo(command) || isLineTo(command)) {
    updatePathValue(command, argIndex, p.x, p.y);
  }

  if (isHorizontalLine(command) || isVerticalLine(command)) {
    const value = isHorizontalLine(command) ? p.x : p.y;

    updatePathValue(command, argIndex, value);
  }

  if (isCubicBezier(command)) {
    updatePathValue(command, argIndex, p.x, p.y);
  }
};

const getHandlesPositions = (commands: PathCommands): Record<number, { point: Point; startPoint?: Point }[]> => {
  const points: Record<number, { point: Point; startPoint?: Point }[]> = {};

  let currentPoint = commands[0][1];
  let idx = 0;

  for (const command of commands) {
    points[idx] = [];

    if (isMoveTo(command) || isLineTo(command)) {
      const [_, point] = command;

      points[idx].push({ point });
      currentPoint = point;
    }

    if (isHorizontalLine(command) || isVerticalLine(command)) {
      const [_, length] = command;
      const [x, y] = isHorizontalLine(command) ? [length, currentPoint.y] : [currentPoint.x, length];

      points[idx].push({ point: { x, y } });

      currentPoint.x = x;
      currentPoint.y = y;
    }

    if (isCubicBezier(command)) {
      const [_, h1, h2, p] = command;

      points[idx].push({ point: h1, startPoint: currentPoint });
      points[idx].push({ point: h2, startPoint: p });
      points[idx].push({ point: p });

      currentPoint = p;
    }

    idx++;
  }

  return points;
};

const updateHandlesPositions = (commands: PathCommands, handles: Record<number, HandleRef[]>) => {
  for (const [index, points] of Object.entries(getHandlesPositions(commands))) {
    const commandIndex = Number(index);

    for (const [index, { point, startPoint }] of Object.entries(points)) {
      const pointIndex = Number(index);

      handles[commandIndex][pointIndex].move(point);

      if (startPoint) {
        handles[commandIndex][pointIndex].setStartPoint(startPoint);
      }
    }
  }
};

export const PathComponent: React.FC<Path> = (path) => {
  const { type: _, id, commands, ...props } = path;

  const ref = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const handlesRefs = useRef<Record<number, HandleRef[]>>({});

  const dispatch = useDispatch();

  const handleMoveHandle = (commandIndex: number, argIndex: number) => (p: Point, mouse: 'move' | 'up') => {
    const nextCommand = produce(commands, (draftState) => processHandleMove(draftState, commandIndex, argIndex, p));

    updateHandlesPositions(nextCommand, handlesRefs.current);

    if (mouse === 'move') {
      pathRef.current?.setAttribute('d', stringifyCommands(nextCommand));
    } else if (mouse === 'up') {
      dispatch(
        updateShape({
          id: path.id,
          commands: nextCommand,
        })
      );
    }
  };

  const getHandles = () => {
    const handles: ReactElement[] = [];

    handlesRefs.current = {};

    const registerHandleRef = (idx: number) => (ref: HandleRef) => {
      if (!ref) {
        return;
      }

      if (!handlesRefs.current[idx]) {
        handlesRefs.current[idx] = [];
      }

      handlesRefs.current[idx].push(ref);
    };

    const addHandle = (commandIndex: number, key: string, props: HandleProps) => {
      handles.push(<Handle key={key} ref={registerHandleRef(commandIndex)} {...props} />);
    };

    for (const [index, points] of Object.entries(getHandlesPositions(commands))) {
      const commandIndex = Number(index);

      if (isCubicBezier(commands[commandIndex])) {
        const [{ point: h1, startPoint: h1StartPoint }, { point: h2, startPoint: h2StartPoint }, { point: p }] = points;

        addHandle(commandIndex, `${commandIndex}-h1`, {
          ...h1,
          startPoint: h1StartPoint,
          onMove: handleMoveHandle(commandIndex, 0),
        });

        addHandle(commandIndex, `${commandIndex}-h2`, {
          ...h2,
          startPoint: h2StartPoint,
          onMove: handleMoveHandle(commandIndex, 1),
        });

        addHandle(commandIndex, `${commandIndex}`, {
          ...p,
          onMove: handleMoveHandle(commandIndex, 2),
        });
      } else {
        const [{ point }] = points;

        addHandle(commandIndex, commandIndex.toString(), {
          ...point,
          onMove: handleMoveHandle(commandIndex, 0),
        });
      }
    }

    return handles;
  };

  return (
    <g key={id} ref={ref}>
      <path ref={pathRef} d={stringifyCommands(commands)} {...props} />
      {getHandles()}
    </g>
  );
};
