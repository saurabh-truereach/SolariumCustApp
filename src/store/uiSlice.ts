/**
 * UI Slice
 * Manages global UI state (loading, modals, etc.)
 */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * UI State
 */
export interface UIState {
  isLoading: boolean;
  loadingMessage?: string;
  activeModal?: string;
  networkStatus: 'online' | 'offline';
}

/**
 * Initial state
 */
const initialState: UIState = {
  isLoading: false,
  loadingMessage: undefined,
  activeModal: undefined,
  networkStatus: 'online',
};

/**
 * UI slice
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (
      state,
      action: PayloadAction<{isLoading: boolean; message?: string}>
    ) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message;
    },
    showModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    hideModal: state => {
      state.activeModal = undefined;
    },
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline'>) => {
      state.networkStatus = action.payload;
    },
  },
});

export const {setLoading, showModal, hideModal, setNetworkStatus} =
  uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectIsLoading = (state: {ui: UIState}) => state.ui.isLoading;
export const selectLoadingMessage = (state: {ui: UIState}) =>
  state.ui.loadingMessage;
export const selectActiveModal = (state: {ui: UIState}) => state.ui.activeModal;
export const selectNetworkStatus = (state: {ui: UIState}) =>
  state.ui.networkStatus;
