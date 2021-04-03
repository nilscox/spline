import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import BoundingBox from '../BoundingBox';
import CenterCross from '../CenterCross';
import { isSelectedSelector } from '../slices/selection.slice';
import useTransforms from '../useTransforms';
import { Shape } from './shape';

export type Circle = Shape<'circle'> & {
  radius: number;
};

export const isCircle = (shape: Shape<string>): shape is Circle => shape.type === 'circle';

export const CircleComponent: React.FC<Circle> = (circle) => {
  const { type: _, id, x, y, radius, ...props } = circle;

  const ref = useRef<SVGGElement>(null);
  const selected = useSelector(isSelectedSelector)(id);
  const transformsProps = useTransforms(circle, ref);

  return (
    <g key={id} ref={ref}>
      <circle cx={x} cy={y} r={radius} {...props} {...transformsProps} />
      {selected && (
        <>
          <CenterCross x={x} y={y} size={radius / 4} />
          <BoundingBox x={x - radius} y={y - radius} width={2 * radius} height={2 * radius} />
        </>
      )}
    </g>
  );
};
