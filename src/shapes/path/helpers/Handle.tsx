import React, { forwardRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Cross, { CrossRef } from '../../../Cross';

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
  setDraggable: (draggable: boolean) => void;
};

const HandleComponent = forwardRef<HandleRef, HandleProps>(({ x, y, onMove }, ref) => {
  const strokeWidth = useHelperStrokeWidth();
  const size = strokeWidth * 15;

  const rectRef = useRef<SVGRectElement>(null);
  const crossRef = useRef<CrossRef>(null);

  const [draggable, setDraggable] = useState(true);

  const translateHandlers = useTranslation(onMove);

  useImperativeHandle(ref, () => ({
    setPosition: ({ x, y }: Point) => {
      rectRef.current?.setAttribute('transform', `translate(${x}, ${y})`);
      crossRef.current?.setPosition({ x, y });
    },
    setDraggable,
  }));

  return (
    <>
      <rect
        ref={rectRef}
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        fill="#0001"
        stroke="#0006"
        strokeWidth={strokeWidth}
        transform={`translate(${x}, ${y})`}
        pointerEvents={draggable ? 'all' : 'none'}
        cursor={draggable ? 'grab' : undefined}
        strokeDasharray={!draggable ? 2 * strokeWidth : undefined}
        {...(draggable && translateHandlers)}
      />
      <Cross ref={crossRef} x={x} y={y} size={size * (2 / 3)} color="#0006" pointerEvents="none" />
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

  set draggable(draggable: boolean) {
    this.ref?.setDraggable(draggable);
  }

  setPosition(point: Point) {
    this.ref?.setPosition(point);
  }
}

export default Handle;
