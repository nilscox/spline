import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

import { Circle } from '../shapes/circle';
import { Rectangle } from '../shapes/rectangle';
import { Shape } from '../shapes/shape';

type AnyShape = Omit<Circle, 'id'> | Omit<Rectangle, 'id'>;

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
  },
});

export const addShape = shapesSlice.actions.add;
export const moveShape = shapesSlice.actions.move;
