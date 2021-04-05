import React, { forwardRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { Point } from '../../../Point';
import useHelperStrokeWidth from '../../../useHelperStrokeWidth';
import useTranslation from '../../../useTranslation';

export type HandleProps = {
  x: number;
  y: number;
  onMove: (p: { x: number; y: number }, mouse: 'up' | 'move') => void;
};

export type HandleRef = {
  setPosition: (point: Point) => void;
};

const HandleComponent = forwardRef<HandleRef, HandleProps>(({ x, y, onMove }, ref) => {
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

class Handle {
  private id = uuid();

  private ref: HandleRef | null = null;
  public element: ReactElement;

  constructor(private position: Point, onMove: HandleProps['onMove']) {
    this.element = (
      <HandleComponent
        key={this.id}
        ref={(ref) => (this.ref = ref)}
        x={this.position.x}
        y={this.position.y}
        onMove={onMove}
      />
    );
  }

  setPosition(point: Point) {
    this.ref?.setPosition(point);
  }
}

export default Handle;