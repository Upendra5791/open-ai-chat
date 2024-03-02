import { configureStore } from '@reduxjs/toolkit'
import chatReducer, { ChatSlice } from './ChatsSlice';
import userReducer, { User } from './UserSlice';

export type AppState = {
    user: User
    chatsSlice: ChatSlice
}

export default configureStore({
  reducer: {
    chatsSlice: chatReducer,
    user: userReducer
  },
})