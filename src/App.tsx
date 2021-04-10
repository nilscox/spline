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

const App: React.FC = () => {
  const config = useVariables();

  const [width, height] = [config.viewWidth, config.viewHeight];
  const viewBox = useViewBox(config);

  const dispatch = useDispatch();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    dispatch(addShape({ type: 'circle', x: 8, y: 8, radius: 4, fill: '#ABCDEF' }));
    dispatch(addShape({ type: 'rectangle', x: 11.9, y: 5.6, width: 3, height: 5, fill: '#DCBAFE' }));
    dispatch(
      addShape({
        type: 'path',
        x: 0,
        y: 0,
        commands: [
          ['M', { x: 20, y: 20 }],
          ['c', { x: 10, y: 30 }, { x: 30, y: -10 }, { x: 40, y: 10 }],
          // ['C', { x: 20, y: 30 }, { x: 30, y: 10 }, { x: 40, y: 20 }],
          // ['S', { x: 60, y: 10 }, { x: 60, y: 20 }],
          ['s', { x: 10, y: -10 }, { x: 20, y: 0 }],
          // ['l', { x: 20, y: 10 }],
          // ['l', { x: 10, y: 0 }],
          // ['v', 20],
          // ['h', 40],
          // ['h', 20],
          // ['Z'],
        ],
        stroke: '#FEDCBA',
        fill: 'transparent',
        strokeWidth: 1,
      })
    );
  }, []);

  return (
    <configContext.Provider value={config}>
      <div id="container" style={{ width, height, position: 'relative' }}>
        <SvgOutput ref={svgRef} width="100%" height="100%" viewBox={viewBox} style={{ position: 'absolute' }} />
      </div>
      <TextArea />
    </configContext.Provider>
  );
};

export default App;
