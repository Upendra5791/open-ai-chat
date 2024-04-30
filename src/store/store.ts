import { configureStore } from '@reduxjs/toolkit'
import chatReducer, { ChatSlice } from './ChatsSlice';
import userReducer, { User } from './UserSlice';
import themeReducer, { Theme }  from './ThemeSlice';
import toolsReducer, { ToolsSlice } from './ToolsSlice';

export type AppState = {
    user: User
    chatsSlice: ChatSlice,
    theme: Theme,
    toolsSlice: ToolsSlice
}

const store =  configureStore({
  reducer: {
    chatsSlice: chatReducer,
    user: userReducer,
    toolsSlice: toolsReducer,
    theme: themeReducer
  }
});
export type AppDispatch = typeof store.dispatch;
export default store;