import { createSlice } from '@reduxjs/toolkit'

export type User = {
    name: string,
    socketId: string,
    id: string,
    assistant?: Assistant
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
            state.assistant = payload.assistant;
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateUser } = userSlice.actions

export default userSlice.reducer