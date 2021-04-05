export type Point = {
  x: number;
  y: number;
};

export const isPoint = (p: any): p is Point => {
  return typeof p?.x === 'number' && typeof p?.y === 'number';
};

export const addPoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point = { x: 0, y: 0 }): Point => {
  return { x: x1 + x2, y: y1 + y2 };
};

export const substractPoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point = { x: 0, y: 0 }): Point => {
  return { x: x1 - x2, y: y1 - y2 };
};
