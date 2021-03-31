import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectionSlice = createSlice({
  name: 'selection',
  initialState: { value: null as string | null },
  reducers: {
    set: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    unset: (state) => {
      state.value = null;
    },
  },
});

export const setSelection = selectionSlice.actions.set;
export const clearSelection = selectionSlice.actions.unset;

export const selectionSelector = (state: RootState) => state.selection.value;

export const isSelectedSelector = createSelector(selectionSelector, (selection) => (id: string) => selection === id);
