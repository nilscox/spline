import { SVGProps } from 'react';

export type Shape<T extends string> = Partial<SVGProps<SVGElement>> & {
  type: T;
  id: string;
};
