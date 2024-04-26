import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
  name: "game",
  initialState: {
    level: 3,
    lives: 1,
    easyMode: false,
    losed: false,
    hintProzrenie: false,
    hintAlohomora: false,
  },
  reducers: {
    setLevel(state, action) {
      state.level = action.payload.level;
    },
    setMode(state, action) {
      state.easyMode = action.payload.easyMode;
      state.lives = state.easyMode ? 3 : 1;
    },
    miss(state) {
      state.lives--;
      if (state.lives < 1) {
        state.losed = true;
      }
    },
    restart(state) {
      state.lives = state.easyMode ? 3 : 1;
      state.losed = false;
      state.hintProzrenie = false;
      state.hintAlohomora = false;
    },
    setProzrenie(state, action) {
      state.hintProzrenie = action.payload;
    },
    setAlohomora(state, action) {
      state.hintAlohomora = action.payload;
    },
    setAlohomoraPause(state, action) {
      state.hintAlohomora = action.payload.state;
    },
    clearStore(state) {
      state.level = 3;
      state.lives = 1;
      state.losed = false;
      state.easyMode = false;
      state.hintProzrenie = false;
      state.hintAlohomora = false;
    },
  },
});

export const { setMode, miss, restart, setLevel, clearStore, setProzrenie, setAlohomora, setAlohomoraPause } =
  gameSlice.actions;
export const gameReducer = gameSlice.reducer;
