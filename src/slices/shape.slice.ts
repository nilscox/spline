import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

import { Circle } from '../shapes/circle';
import { isPath, isPoint, Path } from '../shapes/path';
import { Rectangle } from '../shapes/rectangle';
import { Shape } from '../shapes/shape';

type AnyShape = Omit<Circle, 'id'> | Omit<Rectangle, 'id'> | Omit<Path, 'id'>;

export const shapesSlice = createSlice({
  name: 'shapes',
  initialState: [] as Shape<string>[],
  reducers: {
    add: (state, action: PayloadAction<AnyShape>) => {
      state.push({ id: uuid(), ...action.payload });
    },
    move: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const shape = state.find((shape) => shape.id === action.payload.id);

      if (!shape) {
        return;
      }

      shape.x += action.payload.x;
      shape.y += action.payload.y;
    },
    update: (state, { payload: { id, ...updates } }: PayloadAction<Partial<AnyShape> & { id: string }>) => {
      const shape = state.find((shape) => shape.id === id);

      if (shape) {
        for (const [k, v] of Object.entries(updates)) {
          // @ts-ignore
          shape[k] = v;
        }
      }
    },
    updatePathPoint: (
      state,
      {
        payload: { id, commandIndex, argIndex = 0, point },
      }: PayloadAction<{ id: string; commandIndex: number; argIndex?: number; point: { x: number; y: number } }>
    ) => {
      const path = state.find((shape) => shape.id === id);

      if (!path || !isPath(path)) {
        return;
      }

      const arg = path.commands[commandIndex][argIndex];

      if (!isPoint(arg)) {
        return;
      }

      arg.x = point.x;
      arg.y = point.y;
    },
  },
});

export const addShape = shapesSlice.actions.add;
export const moveShape = shapesSlice.actions.move;
export const updateShape = shapesSlice.actions.update;
