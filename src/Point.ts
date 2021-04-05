export type Point = {
  x: number;
  y: number;
};

export const isPoint = (p: any): p is Point => {
  return typeof p?.x === 'number' && typeof p?.y === 'number';
};
