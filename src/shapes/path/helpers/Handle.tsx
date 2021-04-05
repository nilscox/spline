import React, { forwardRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import Cross, { CrossRef } from '../../../Cross';

import { Point } from '../../../Point';
import useHelperStrokeWidth from '../../../useHelperStrokeWidth';
import useTranslation from '../../../useTranslation';

export type HandleProps = React.SVGProps<SVGRectElement> & {
  x: number;
  y: number;
  onMove?: (p: { x: number; y: number }, mouse: 'up' | 'move') => void;
};

export type HandleRef = {
  setPosition: (point: Point) => void;
};

const HandleComponent = forwardRef<HandleRef, HandleProps>(({ x, y, onMove, ...props }, ref) => {
  const strokeWidth = useHelperStrokeWidth();
  const size = strokeWidth * 15;

  const rectRef = useRef<SVGRectElement>(null);
  const crossRef = useRef<CrossRef>(null);

  const translateHandlers = useTranslation(onMove ?? (() => {}), true);

  useImperativeHandle(ref, () => ({
    setPosition: ({ x, y }: Point) => {
      rectRef.current?.setAttribute('transform', `translate(${x}, ${y})`);
      crossRef.current?.setPosition({ x, y });
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
        {...(onMove && translateHandlers)}
        {...props}
        style={{ cursor: onMove ? 'grab' : undefined, ...props.style }}
      />
      <Cross
        ref={crossRef}
        x={x}
        y={y}
        size={size * (2 / 3)}
        color="#99F"
        style={{ ...props.style, pointerEvents: 'none' }}
      />
    </>
  );
});

class Handle {
  private id = uuid();

  private ref: HandleRef | null = null;
  public element: ReactElement;

  constructor(private position: Point, onMove?: HandleProps['onMove'], dash = false) {
    this.element = (
      <HandleComponent
        key={this.id}
        ref={(ref) => (this.ref = ref)}
        x={this.position.x}
        y={this.position.y}
        onMove={onMove}
        strokeDasharray={dash ? 1 : undefined}
        style={{ pointerEvents: dash ? 'none' : undefined }}
      />
    );
  }

  setPosition(point: Point) {
    this.ref?.setPosition(point);
  }
}

export default Handle;
