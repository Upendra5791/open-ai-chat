import { createSlice } from '@reduxjs/toolkit'
import { AppDispatch, AppState } from './store'
import { getUserFromIndexedDB, saveUserToIndexedDB } from '../utils/indexedDB'

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
    }
})

// Action creators are generated for each case reducer function
export const { updateUser } = userSlice.actions;

export const getUser = (state: AppState) => state.user;

export default userSlice.reducer


// Thunks
export const fetchUser = () => (dispatch: AppDispatch) => {
    getUserFromIndexedDB()
        .then((users: User[]) => {
            if (users.length) {
                dispatch(updateUser(users[0]));
            }
        })
        .catch(error => {
            console.error('Error retrieving user from IndexedDB:', error);
        });
}

export const saveUser = (user: User) => async (dispatch: AppDispatch) => {
    try {
        await saveUserToIndexedDB('user', user);
        console.log('User saved to IndexedDB');
        dispatch(updateUser(user));
        return user;
    } catch (error: any) {
        console.error('Error saving user to IndexedDB:', error);
        return user;
    };
} 