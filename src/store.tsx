import { configureStore } from '@reduxjs/toolkit';

import { configSlice } from './slices/config.slice';
import { selectionSlice } from './slices/selection.slice';
import { shapesSlice } from './slices/shape.slice';

const store = configureStore({
  devTools: true,
  reducer: {
    config: configSlice.reducer,
    shapes: shapesSlice.reducer,
    selection: selectionSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
