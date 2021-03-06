import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Point } from './Point';

import useHelperStrokeWidth from './useHelperStrokeWidth';

export type CrossProps = React.SVGProps<SVGGElement> & {
  x: number;
  y: number;
  size: number;
  color?: string;
};

export type CrossRef = {
  setPosition: (position: Point) => void;
};

const Cross = forwardRef<CrossRef, CrossProps>(({ x, y, size, color, ...props }, ref) => {
  const strokeWidth = useHelperStrokeWidth();
  const groupRef = useRef<SVGGElement>(null);

  useImperativeHandle(ref, () => ({
    setPosition: ({ x, y }) => {
      groupRef.current?.setAttribute('transform', `translate(${x}, ${y})`);
    },
  }));

  return (
    <g ref={groupRef} transform={`translate(${x}, ${y})`} stroke={color ?? 'grey'} strokeWidth={strokeWidth} {...props}>
      <line x1={-size / 2} y1={0} x2={size / 2} y2={0} />
      <line x1={0} y1={-size / 2} x2={0} y2={size / 2} />
    </g>
  );
});

export default Cross;
