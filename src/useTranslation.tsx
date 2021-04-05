import { MouseEventHandler, useRef } from 'react';

import { useConfig, useSvg } from './App';
import { Point } from './Point';
import useSvgPoint from './useSvgPoint';

const useTranslation = (
  setTranslation: (p: { x: number; y: number }, mouse: 'up' | 'move') => void,
  absolute = false
) => {
  const svg = useSvg();

  const getSvgPoint = useSvgPoint();
  const dragStart = useRef<SVGPoint>();

  const { snapToGrid, gridCellSize } = useConfig();
  const snap = (p: Point): Point => {
    if (!snapToGrid) {
      return p;
    }

    return {
      x: Math.round(p.x / gridCellSize) * gridCellSize,
      y: Math.round(p.y / gridCellSize) * gridCellSize,
    };
  };

  const onMouseDown: MouseEventHandler = (e) => {
    if (dragStart.current || !svg) {
      return;
    }

    dragStart.current = getSvgPoint(e.clientX, e.clientY);
    svg.style.cursor = 'grabbing';

    const removeListeners = () => {
      svg?.removeEventListener('mouseup', onMouseUp);
      svg?.removeEventListener('mousemove', onMouseMove);
      svg?.removeEventListener('mouseup', removeListeners);
    };

    svg?.addEventListener('mouseup', onMouseUp);
    svg?.addEventListener('mousemove', onMouseMove);
    svg?.addEventListener('mouseup', removeListeners);
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!svg || !dragStart.current) {
      return;
    }

    const { x, y } = absolute ? { x: 0, y: 0 } : dragStart.current;
    const p = getSvgPoint(e.clientX, e.clientY);

    setTranslation(snap({ x: p.x - x, y: p.y - y }), 'up');

    dragStart.current = undefined;
    svg.style.cursor = 'default';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!svg || !dragStart.current) {
      return;
    }

    const { x, y } = absolute ? { x: 0, y: 0 } : dragStart.current;
    const p = getSvgPoint(e.clientX, e.clientY);

    setTranslation(snap({ x: p.x - x, y: p.y - y }), 'move');
  };

  return { onMouseDown };
};

export default useTranslation;
