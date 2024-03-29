import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './store'

export type User = {
    name: string,
    socketId: string,
    id: string,
    assistantId?: string,
    threadId?: string
}

export type Assistant = {
    assistantId: string,
    threadId: string
}

const initialState: User = {} as User;

export const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        updateUser: (state, { payload }: { payload: User }) => {
            state.id = payload.id;
            state.name = payload.name;
            state.socketId = payload.socketId;
            state.assistantId = payload.assistantId;
            state.threadId = payload.threadId;
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateUser } = userSlice.actions;

export const getUser = (state: AppState) => state.user;

export default userSlice.reducer