export type Shape<T extends string> = {
  type: T;
  id: string;
  x: number;
  y: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};
