import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import { Point } from '../Point';
import useHelperStrokeWidth from '../useHelperStrokeWidth';
import useTranslation from '../useTranslation';

export type HandleProps = {
  x: number;
  y: number;
  onMove: (p: { x: number; y: number }, mouse: 'up' | 'move') => void;
};

export type HandleRef = {
  setPosition: (point: Point) => void;
};

const Handle = forwardRef<HandleRef, HandleProps>(({ x, y, onMove }, ref) => {
  const strokeWidth = useHelperStrokeWidth();
  const size = strokeWidth * 15;
  const lineRef = useRef<SVGLineElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  const translateHandlers = useTranslation(onMove, true);

  useImperativeHandle(ref, () => ({
    setPosition: ({ x, y }: Point) => {
      lineRef.current?.setAttribute('x2', `${x}`);
      lineRef.current?.setAttribute('y2', `${y}`);
      rectRef.current?.setAttribute('transform', `translate(${x}, ${y})`);
    },
  }));

  return (
    <>
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

export default Handle;
