import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import BoundingBox from '../BoundingBox';
import CenterCross from '../CenterCross';
import { isSelectedSelector } from '../slices/selection.slice';
import useDrag from '../useDrag';

import { Shape } from './shape';

export type Rectangle = Shape<'rectangle'> & {
  width: number;
  height: number;
};

export const isRectangle = (shape: Shape<string>): shape is Rectangle => shape.type === 'rectangle';

export const RectangleComponent: React.FC<Rectangle> = (rectangle) => {
  const { type: _, id, x, y, width, height, ...props } = rectangle;

  const ref = useRef<SVGGElement>(null);
  const selected = useSelector(isSelectedSelector)(id);
  const dragHandlers = useDrag(rectangle, ref.current);

  return (
    <g key={id} ref={ref}>
      <rect x={x} y={y} width={width} height={height} {...props} {...dragHandlers} />
      {selected && (
        <>
          <CenterCross x={x + width / 2} y={y + height / 2} size={Math.max(width, height) / 6} />
          <BoundingBox x={x} y={y} width={width} height={height} />
        </>
      )}
    </g>
  );
};
