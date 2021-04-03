import { MouseEventHandler, useRef } from 'react';

import { useSvg } from './App';
import useSvgPoint from './useSvgPoint';

const useTranslation = (setTranslation: (p: { x: number; y: number }, mouse: 'up' | 'move') => void) => {
  const svg = useSvg();

  const getSvgPoint = useSvgPoint();
  const dragStart = useRef<SVGPoint>();

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

    const { x, y } = dragStart.current;
    const p = getSvgPoint(e.clientX, e.clientY);

    setTranslation({ x: p.x - x, y: p.y - y }, 'up');

    dragStart.current = undefined;
    svg.style.cursor = 'default';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!svg || !dragStart.current) {
      return;
    }

    const { x, y } = dragStart.current;
    const p = getSvgPoint(e.clientX, e.clientY);

    setTranslation({ x: p.x - x, y: p.y - y }, 'move');
  };

  return { onMouseDown };
};

export default useTranslation;
