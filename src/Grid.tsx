import React from 'react';
import { useConfig } from './App';
import useHelperStrokeWidth from './useHelperStrokeWidth';

const Grid: React.FC = () => {
  const {
    gridCellSize: cellSize,
    showGrid: show,
    viewWidth: width,
    viewHeight: height,
    viewBoxX,
    viewBoxY,
    viewBoxWidth,
    viewBoxHeight,
  } = useConfig();

  const strokeWidth = useHelperStrokeWidth();

  return (
    <g visibility={show ? 'visible' : 'hidden'}>
      {new Array(height).fill(null).map((_, n) => (
        <line
          key={n}
          x1={viewBoxX}
          y1={n * cellSize}
          x2={viewBoxWidth}
          y2={n * cellSize}
          stroke="#0003"
          strokeWidth={strokeWidth}
        />
      ))}
      {new Array(width).fill(null).map((_, n) => (
        <line
          key={n}
          x1={n * cellSize}
          y1={viewBoxY}
          x2={n * cellSize}
          y2={viewBoxHeight}
          stroke="#0003"
          strokeWidth={strokeWidth}
        />
      ))}
    </g>
  );
};

export default Grid;
