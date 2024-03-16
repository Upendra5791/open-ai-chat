import { configureStore } from '@reduxjs/toolkit'
import chatReducer, { ChatSlice } from './ChatsSlice';
import userReducer, { User } from './UserSlice';
import themeReducer, { Theme }  from './ThemeSlice';

export type AppState = {
    user: User
    chatsSlice: ChatSlice,
    theme: Theme
}

const store =  configureStore({
  reducer: {
    chatsSlice: chatReducer,
    user: userReducer,
    theme: themeReducer
  }
});
export type AppDispatch = typeof store.dispatch;
export default store;