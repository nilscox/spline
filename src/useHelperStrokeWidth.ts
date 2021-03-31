import { useConfig } from './App';

const useHelperStrokeWidth = () => {
  const { viewBoxWidth, viewBoxX, viewWidth, viewBoxHeight, viewBoxY, viewHeight } = useConfig();

  return Math.max((viewBoxWidth - viewBoxX) / viewWidth, (viewBoxHeight - viewBoxY) / viewHeight);
};

export default useHelperStrokeWidth;
