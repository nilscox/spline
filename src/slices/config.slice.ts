import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Config = {
  viewWidth: number;
  viewHeight: number;
  gridCellSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  viewBoxX: number;
  viewBoxY: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
};

const initialConfig: Config = {
  viewWidth: 600,
  viewHeight: 600,
  gridCellSize: 10,
  showGrid: true,
  snapToGrid: true,
  viewBoxX: 0,
  viewBoxY: 0,
  viewBoxWidth: 100,
  viewBoxHeight: 100,
};

export const configSlice = createSlice({
  name: 'configuration',
  initialState: initialConfig,
  reducers: {
    set: (state: Config, action: PayloadAction<Partial<Config>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const setConfig = configSlice.actions.set;
