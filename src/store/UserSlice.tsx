import { createSlice } from '@reduxjs/toolkit'
import { Socket } from 'socket.io-client'

export type User = {
    name: string,
    socketId: string,
    id: string,
    socket?: {
        connection: Socket
    }
}

/* export type UserState = {
    user: User
} */

/* const initialState: UserState = {
    user: {
        name: 'eeeeeeeeeee',
        socketId: '',
        id: ''
    }
  }; */

const initialState: User = {} as User;

export const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        updateUser: (state, { payload }: { payload: User }) => {
            state.id = payload.id;
            state.name = payload.name;
            state.socketId = payload.socketId
        },
        updateSocket: (state, { payload }) => {
            state.socket = payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateUser, updateSocket } = userSlice.actions

export default userSlice.reducer