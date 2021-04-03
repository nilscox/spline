import { MouseEventHandler } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSvg } from './App';
import { Shape } from './shapes/shape';
import { clearSelection, isSelectedSelector, setSelection } from './slices/selection.slice';

const useShapeSelection = (shape: Shape<string>) => {
  const svg = useSvg();

  const selected = useSelector(isSelectedSelector)(shape.id);
  const dispatch = useDispatch();

  const onMouseDown: MouseEventHandler = () => {
    if (!svg || selected) {
      return;
    }

    dispatch(setSelection(shape.id));

    svg.style.cursor = 'default';

    const onMouseUp = (e: MouseEvent) => {
      if (document.elementFromPoint(e.clientX, e.clientY) !== svg) {
        return;
      }

      svg.removeEventListener('mouseup', onMouseUp);
      dispatch(clearSelection());
    };

    svg.addEventListener('mouseup', onMouseUp);
  };

  return { onMouseDown };
};

export default useShapeSelection;
