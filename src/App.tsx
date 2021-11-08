import React, { createContext, forwardRef, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useVariables from './useVariables';
import { CircleComponent, isCircle } from './shapes/circle';
import { Shape } from './shapes/shape';
import { RootState } from './store';
import useForwardRef from './useForwardedRef';
import { addShape } from './slices/shape.slice';
import { isRectangle, RectangleComponent } from './shapes/rectangle';
import { Config } from './slices/config.slice';
import Grid from './Grid';
import { isPath, PathComponent } from './shapes/path';
import { PathCommands } from './shapes/path/PathCommands';

import pinImg from './pin.png';
import { CommandDef, CommandsDef, isCommand, isMoveTo, MoveToCommand } from './shapes/path/Command';
import { MoveTo } from './shapes/path/commands/MoveLineTo';
import { isPoint, Point } from './Point';

type SvgOutputProps = React.SVGProps<SVGSVGElement>;

const SvgContext = createContext<SVGSVGElement | null>(null);
export const useSvg = () => useContext(SvgContext);

const configContext = createContext<Config>(null as any);
export const useConfig = () => useContext(configContext);

const SvgOutput = forwardRef<SVGSVGElement, SvgOutputProps>((props, forwardedRef) => {
  const shapes = useSelector<RootState, Shape<string>[]>((state) => state.shapes);
  const ref = useForwardRef(forwardedRef);

  const renderShape = (shape: Shape<string>) => {
    if (isCircle(shape)) {
      return <CircleComponent {...shape} />;
    }

    if (isRectangle(shape)) {
      return <RectangleComponent {...shape} />;
    }

    if (isPath(shape)) {
      return <PathComponent {...shape} />;
    }
  };

  return (
    <SvgContext.Provider value={ref.current}>
      <svg ref={ref} {...props}>
        {shapes.map((shape) => (
          <React.Fragment key={shape.id}>{renderShape(shape)}</React.Fragment>
        ))}
        <Grid />
      </svg>
    </SvgContext.Provider>
  );
});

const useViewBox = (config = useSelector<RootState, Config>((state) => state.config)) => {
  return [config.viewBoxX, config.viewBoxY, config.viewBoxWidth, config.viewBoxHeight].join(' ');
};

const useSvgCode = (shapes: Shape<string>[]) => {
  const viewBox = useViewBox();

  const getShapeAttributes = (shape: Shape<string>) => {
    if (isCircle(shape)) {
      return { cx: shape.x, cy: shape.y, r: shape.radius };
    }

    if (isRectangle(shape)) {
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    }

    if (isPath(shape)) {
      return { d: new PathCommands(shape.commands, () => {}).toString() };
    }

    return {};
  };

  const getShape = (shape: Shape<string>) => {
    const shapeAttrs = Object.entries(getShapeAttributes(shape))
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');

    const commonAttrs = ['fill', 'stroke', 'strokeWidth']
      .filter((attr) => shape[attr as keyof Shape<string>])
      .map((attr) => `${attr}="${shape[attr as keyof Shape<string>]}"`)
      .join(' ');

    return `<${shape.type} ${shapeAttrs} ${commonAttrs} />`;
  };

  return [`<svg viewBox="${viewBox}">`, ...shapes.map(getShape).map((shape) => `  ${shape}`), '</svg>'].join('\n');
};

const TextArea: React.FC = () => {
  const width = useSelector<RootState, number>((state) => state.config.viewWidth);
  const shapes = useSelector<RootState, Shape<string>[]>((state) => state.shapes);

  return (
    <textarea
      value={useSvgCode(shapes)}
      onChange={() => {}}
      spellCheck={false}
      style={{
        width: Math.max(width, 800),
        height: 200,
        marginTop: 16,
        padding: 8,
        border: 'none',
        boxSizing: 'border-box',
        outline: 'none',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        overflow: 'auto',
      }}
    />
  );
};

const ImageOverlay: React.FC = () => {
  return <img src={pinImg} style={{ width: '100%', height: '100%', opacity: 0.2, pointerEvents: 'none' }} />;
};

const openInNewTab =
  'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z';
const reply = 'M10 9V5l-7 7 l 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z';
const pin =
  'M 13 15 h 6 s 3 -3, -3 -5 v -7 c 3 0, 3 -3, 0 -3 h -8 c -3 0, -3 3, 0 3 v 7 c -6 2, -3 5, -3 5 h 6 v 9 h 2 z';

const parsePathCommands = (d: string): CommandsDef => {
  const commands: CommandDef[] = [];

  let currentCommand = '';
  let currentArgs: Array<number | Point> = [];

  for (let i = 0; i < d.length; ++i) {
    if (d[i] === ' ') {
      continue;
    }

    if (/[a-zA-Z]/.exec(d[i])) {
      currentCommand = d[i];

      if (currentCommand.toUpperCase() === 'Z') {
        commands.push([currentCommand as 'Z' | 'z']);
        currentArgs = [];
      }

      continue;
    }

    if (/[-.0-9]/.exec(d[i])) {
      const arg = parseFloat(d.slice(i));

      currentArgs.push(arg);

      if (d[i] === '-') ++i;

      let dot = false;
      while (i < d.length && (/[0-9]/.exec(d[i]) || (d[i] === '.' && !dot))) {
        if (d[i] === '.') dot = true;
        ++i;
      }

      --i;
    }

    const len = currentArgs.length;
    const last1 = currentArgs[len - 1];
    const last2 = currentArgs[len - 2];

    if (typeof last1 === 'number' && typeof last2 === 'number') {
      currentArgs.splice(len - 2, 2, { x: last2, y: last1 });
    }

    if (['M', 'L'].includes(currentCommand.toUpperCase()) && isPoint(currentArgs[0])) {
      commands.push([currentCommand as 'M' | 'm' | 'L' | 'l', currentArgs[0]]);
      currentArgs = [];
    }

    if (['V', 'H'].includes(currentCommand.toUpperCase()) && typeof currentArgs[0] === 'number') {
      commands.push([currentCommand as 'V' | 'v' | 'H' | 'h', currentArgs[0]]);
      currentArgs = [];
    }

    if (
      currentCommand.toUpperCase() === 'C' &&
      isPoint(currentArgs[0]) &&
      isPoint(currentArgs[1]) &&
      isPoint(currentArgs[2])
    ) {
      commands.push([currentCommand as 'C' | 'c', currentArgs[0], currentArgs[1], currentArgs[2]]);
      currentArgs = [];
    }

    if (currentCommand.toUpperCase() === 'S' && isPoint(currentArgs[0]) && isPoint(currentArgs[1])) {
      commands.push([currentCommand as 'S' | 's', currentArgs[0], currentArgs[1]]);
      currentArgs = [];
    }
  }

  console.log(commands);
  const [first, ...rest] = commands;

  if (!isMoveTo(first)) {
    throw new Error('first command must be move to');
  }

  return [first, ...rest];
};

const App: React.FC = () => {
  const config = useVariables();

  const [width, height] = [config.viewWidth, config.viewHeight];
  const viewBox = useViewBox(config);

  const dispatch = useDispatch();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // dispatch(addShape({ type: 'circle', x: 8, y: 8, radius: 4, fill: '#ABCDEF' }));
    // dispatch(addShape({ type: 'rectangle', x: 11.9, y: 5.6, width: 3, height: 5, fill: '#DCBAFE' }));
    dispatch(
      addShape({
        type: 'path',
        x: 0,
        y: 0,
        commands: parsePathCommands(pin),
        stroke: '#FEDCBA',
        fill: 'transparent',
        strokeWidth: 0.1,
      })
    );
  }, []);

  return (
    <configContext.Provider value={config}>
      <div id="container" style={{ width, height, position: 'relative' }}>
        <SvgOutput ref={svgRef} width="100%" height="100%" viewBox={viewBox} style={{ position: 'absolute' }} />
        {/* <ImageOverlay /> */}
      </div>
      <TextArea />
    </configContext.Provider>
  );
};

export default App;
