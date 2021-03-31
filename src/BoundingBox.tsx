import React, { SVGProps } from 'react';

import useHelperStrokeWidth from './useHelperStrokeWidth';

const BoundingBox: React.FC<SVGProps<SVGRectElement>> = (props) => {
  const strokeWidth = useHelperStrokeWidth();

  return (
    <rect
      fill="transparent"
      stroke="grey"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      style={{ pointerEvents: 'none' }}
      {...props}
    />
  );
};

export default BoundingBox;
