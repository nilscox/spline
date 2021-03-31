import { useSvg } from './App';

const useSvgPoint = () => {
  const svg = useSvg();

  return (x: number, y: number) => {
    if (!svg) {
      throw new Error('useSvgPoint: svg is null');
    }

    const pt = svg.createSVGPoint();

    pt.x = x;
    pt.y = y;

    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };
};

export default useSvgPoint;
