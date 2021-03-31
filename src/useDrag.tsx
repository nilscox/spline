import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useConfig, useSvg } from './App';
import { Shape } from './shapes/shape';
import { isSelectedSelector, setSelection } from './slices/selection.slice';
import { moveShape } from './slices/shape.slice';
import useSvgPoint from './useSvgPoint';

type Transform = {
  translate: { x: number; y: number };
};

const useSnapToGrid = () => {
  const { snapToGrid, gridCellSize } = useConfig();

  return (value: number) => (snapToGrid ? Math.round(value / gridCellSize) * gridCellSize : value);
};

const useDrag = (shape: Shape<string>, ref: SVGElement | null) => {
  const svg = useSvg();

  const selected = useSelector(isSelectedSelector)(shape.id);
  const dispatch = useDispatch();

  const getSvgPoint = useSvgPoint();
  const transform = useRef<Transform>({ translate: { x: 0, y: 0 } });
  const [dragStart, setDragStart] = useState<SVGPoint>();

  const snapToGrid = useSnapToGrid();

  const setTranslation = (x: number, y: number) => {
    transform.current.translate.x = snapToGrid(x);
    transform.current.translate.y = snapToGrid(y);

    ref!.setAttribute('transform', `translate(${transform.current.translate.x}, ${transform.current.translate.y})`);
  };

  const onMouseDown: MouseEventHandler<SVGGElement> = (e) => {
    if (!selected) {
      dispatch(setSelection(shape.id));
    }

    if (!dragStart) {
      setDragStart(getSvgPoint(e.clientX, e.clientY));
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!dragStart || !ref) {
      return;
    }

    setDragStart(undefined);

    const p = getSvgPoint(e.clientX, e.clientY);
    const offset = { x: p.x - dragStart.x, y: p.y - dragStart.y };

    if (offset.x !== 0 && offset.y !== 0) {
      dispatch(moveShape({ id: shape.id, x: snapToGrid(p.x - dragStart.x), y: snapToGrid(p.y - dragStart.y) }));
    }

    setTranslation(0, 0);

    if (svg) {
      svg.style.cursor = 'default';
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragStart || !ref) {
      return;
    }

    const p = getSvgPoint(e.clientX, e.clientY);

    setTranslation(p.x - dragStart.x, p.y - dragStart.y);

    if (shape.x !== snapToGrid(shape.x) || shape.y !== snapToGrid(shape.y)) {
      dispatch(moveShape({ id: shape.id, x: snapToGrid(shape.x) - shape.x, y: snapToGrid(shape.y) - shape.y }));
    }
  };

  useEffect(() => {
    if (dragStart && svg) {
      svg.addEventListener('mouseup', onMouseUp);
      svg.addEventListener('mousemove', onMouseMove);

      svg.style.cursor = 'grabbing';

      return () => {
        svg.removeEventListener('mouseup', onMouseUp);
        svg.removeEventListener('mousemove', onMouseMove);
      };
    }
  }, [onMouseUp, onMouseMove]);

  return { onMouseDown };
};

export default useDrag;
