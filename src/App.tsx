import React, { createContext, forwardRef, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useVariables from './useVariables';
import { CircleComponent, isCircle } from './shapes/circle';
import { Shape } from './shapes/shape';
import { RootState } from './store';
import useForwardRef from './useForwardedRef';
import { clearSelection, selectionSelector } from './slices/selection.slice';
import { addShape } from './slices/shape.slice';
import { isRectangle, RectangleComponent } from './shapes/rectangle';
import { Config } from './slices/config.slice';
import Grid from './Grid';
import { isPath, PathComponent } from './shapes/path';

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

const App: React.FC = () => {
  const config = useVariables();

  const [width, height] = [config.viewWidth, config.viewHeight];
  const viewBox = [config.viewBoxX, config.viewBoxY, config.viewBoxWidth, config.viewBoxHeight].join(' ');

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
        commands: [
          ['M', { x: 10, y: 10 }],
          ['l', { x: 20, y: 30 }],
          ['l', { x: 20, y: 0 }],
          ['L', { x: 30, y: 30 }],
          ['l', { x: 20, y: 30 }],
          // ['C', { x: 20, y: 20 }, { x: 40, y: 20 }, { x: 50, y: 10 }],
          // ['L', { x: 20, y: 20 }],
          // ['H', 40],
          // ['V', 40],
          // ['L', { x: 20, y: 30 }],
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
    </configContext.Provider>
  );
};

export default App;
