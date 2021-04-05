import React, { forwardRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { Point } from '../../../Point';
import useHelperStrokeWidth from '../../../useHelperStrokeWidth';

export type LineProps = Omit<React.SVGProps<SVGLineElement>, 'start' | 'end'> & {
  start: Point;
  end: Point;
};

export type LineRef = {
  setStart: (point: Point) => void;
  setEnd: (point: Point) => void;
};

const LineComponent = forwardRef<LineRef, LineProps>(({ start, end, ...props }, ref) => {
  const strokeWidth = useHelperStrokeWidth();
  const lineRef = useRef<SVGLineElement>(null);

  useImperativeHandle(ref, () => ({
    setStart: ({ x, y }: Point) => {
      lineRef.current?.setAttribute('x1', `${x}`);
      lineRef.current?.setAttribute('y1', `${y}`);
    },
    setEnd: ({ x, y }: Point) => {
      lineRef.current?.setAttribute('x2', `${x}`);
      lineRef.current?.setAttribute('y2', `${y}`);
    },
  }));

  return (
    <line
      ref={lineRef}
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke="#CCC"
      strokeWidth={strokeWidth}
      {...props}
      style={{ pointerEvents: 'none', ...props.style }}
    />
  );
});

class Line {
  private id = uuid();

  private ref: LineRef | null = null;
  public element: ReactElement;

  constructor(start: Point, end: Point, dash = false) {
    this.element = (
      <LineComponent
        key={this.id}
        ref={(ref) => (this.ref = ref)}
        start={start}
        end={end}
        strokeDasharray={dash ? 1 : undefined}
        style={{ pointerEvents: dash ? 'none' : undefined }}
      />
    );
  }

  setStart(point: Point) {
    this.ref?.setStart(point);
  }

  setEnd(point: Point) {
    this.ref?.setEnd(point);
  }
}

export default Line;
