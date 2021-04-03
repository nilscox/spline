import React from 'react';

import useHelperStrokeWidth from './useHelperStrokeWidth';

type CenterCrossProps = {
  x: number;
  y: number;
  size: number;
  color?: string;
};

const CenterCross: React.FC<CenterCrossProps> = ({ x, y, size, color }) => {
  const strokeWidth = useHelperStrokeWidth();

  return (
    <g stroke={color ?? 'grey'} strokeWidth={strokeWidth} style={{ pointerEvents: 'none' }}>
      <line x1={x - size / 2} y1={y} x2={x + size / 2} y2={y} />
      <line x1={x} y1={y - size / 2} x2={x} y2={y + size / 2} />
    </g>
  );
};

export default CenterCross;
