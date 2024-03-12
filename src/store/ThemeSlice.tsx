import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './store'

export type Theme = {
    mode: 'dark' | 'light';
}
const initialState = {
    mode: 'dark'
}

export const themeSlice = createSlice({
    name: 'theme',
    initialState: initialState,
    reducers: {
        setTheme: (state, { payload }) => {
            state.mode = payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setTheme } = themeSlice.actions;

export const getTheme = (state: AppState) => state.theme.mode;

export default themeSlice.reducer