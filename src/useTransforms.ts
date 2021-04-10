import { MouseEventHandler, RefObject, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { Shape } from './shapes/shape';
import { moveShape } from './slices/shape.slice';
import useShapeSelection from './useShapeSelection';
import useTranslation from './useTranslation';

type Transform = {
  translate: { x: number; y: number };
  rotate: number;
};

const useTransforms = (shape: Shape<string>, ref: RefObject<SVGElement>) => {
  const transform = useRef<Transform>({ translate: { x: 0, y: 0 }, rotate: 0 });
  const dispatch = useDispatch();

  const updateTransform = () => {
    ref.current?.setAttribute(
      'transform',
      [
        `translate(${transform.current.translate.x}, ${transform.current.translate.y})`,
        `rotate(${transform.current.rotate})`,
      ].join(' ')
    );
  };

  const setTranslation = (p: { x: number; y: number }, mouse: 'up' | 'move') => {
    if (mouse === 'move') {
      transform.current.translate.x = p.x;
      transform.current.translate.y = p.y;
    } else {
      transform.current.translate.x = 0;
      transform.current.translate.y = 0;

      dispatch(moveShape({ id: shape.id, ...p }));
    }

    updateTransform();
  };

  const translate = useTranslation(setTranslation);
  const selection = useShapeSelection(shape);

  const onMouseDown: MouseEventHandler = (e) => {
    translate.onMouseDown(e);
    selection.onMouseDown(e);
  };

  return { onMouseDown };
};

export default useTransforms;
