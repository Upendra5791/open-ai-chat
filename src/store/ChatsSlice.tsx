import { createSlice } from "@reduxjs/toolkit";
import { User } from "./UserSlice";

export type RecieveMessageResponse = {
 sender: User,
 message: Message
}

export type Message = {
  text: string;
  time: string;
  senderId: string | undefined;
  recipientId: string | undefined;
}

export type Chat = {
  id: string;
  senderId: string;
  recipientId: string;
  recipientName: string;
  socketId: string;
  messages: Message[];
  isCurrentChat?: boolean;
  unreadMessageCount?: number;
};

export type ChatSlice = {
  chats: Chat[]
}

const initialState: ChatSlice = {
  chats: []
}

export const aiChatInit: Chat = {
  id: 'ai-chat',
  senderId: '',
  recipientId: 'open-ai-v1',
  recipientName: 'Assistant',
  socketId: 'open-ai-v1',
  unreadMessageCount: 1,
  messages: [{
    text: 'Hi there, how can I help you?',
    time: new Date().toString(),
    senderId: 'open-ai-v1',
    recipientId: ''
  }]
}
export const chatsSlice = createSlice({
  name: "chats",
  initialState: initialState,
  reducers: {
    addChat: (state, { payload }: { payload: Chat }) => {
      state.chats = [...state.chats, payload]
    },
    setCurrentChat: (state, { payload }: { payload: string }) => {
      state.chats = state.chats.map(c => {
        if (c.recipientId === payload) {
          return {
            ...c,
            isCurrentChat: true
          }
        } else {
          return {
            ...c,
            isCurrentChat: false
          }
        }
      })
    },
    addNewMessage: (state, { payload }: {payload: {message: Message, chat: Chat}}) => {
      state.chats = state.chats.map((chat: Chat) => {
        if (chat.recipientId === payload.chat.recipientId) {
          return {
            ...chat,
            messages: [...chat.messages, payload.message],
            unreadMessageCount: chat.unreadMessageCount === undefined ? 1 : ++chat.unreadMessageCount
          }
        } else {
          return chat
        }
      })
    },
    updateMessageReadStatus: (state, { payload }: {payload: {chat: Chat}}) => {
      state.chats = state.chats.map((chat: Chat) => {
        if (chat.recipientId === payload.chat.recipientId) {
          return {
            ...chat,
            unreadMessageCount: 0
          }
        } else {
          return chat
        }
      })
    }
  }
});

// Action creators are generated for each case reducer function
export const { addChat, addNewMessage, setCurrentChat, updateMessageReadStatus } = chatsSlice.actions;

export default chatsSlice.reducer;
