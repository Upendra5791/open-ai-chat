import { createSlice } from "@reduxjs/toolkit";
import { User } from "./UserSlice";
import { getUniqueID } from "../utils/uid";
import { AppDispatch } from "./store";
import { addMessageToChat, clearConversation, getChatsFromIndexedDB, resetUnreadMessageCount } from "../utils/indexedDB";
import { socket } from "../utils/socket";
import { socket_sendMessage } from "./emitEvent";

export type RecieveMessageResponse = {
 sender: User,
 message: Message
}

export type Message = {
  id: string;
  text: string;
  time: string;
  senderId: string | undefined;
  recipientId: string | undefined;
  status?: 'PENDING' | 'DELIVERED'
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
    id: getUniqueID(),
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
    },
    clearChat: (state, { payload }: {payload: { chat: Chat }}) => {
      state.chats = state.chats.map((c: Chat) => {
        if (c.id === payload.chat.id) {
          return {
            ...c,
            messages: []
          }
        } else return c;
      })
    }
  }
});

// Action creators are generated for each case reducer function
export const { addChat, addNewMessage, setCurrentChat, updateMessageReadStatus, clearChat } = chatsSlice.actions;

export default chatsSlice.reducer;

export const fetchChats = () => async (dispatch: AppDispatch) => {
  const chatsInDB = await getChatsFromIndexedDB()
  chatsInDB?.forEach((chat: any) => {
    dispatch(addChat(chat));
  });
  return chatsInDB;
};

export const updateMessageStatus = (chat: Chat) => (dispatch: AppDispatch) => {
    dispatch(updateMessageReadStatus({ chat }));
    resetUnreadMessageCount(chat);
}

export const sendMessage = (chat: Chat, message: Message, instructions?: string) => (dispatch: AppDispatch) => {
  if (instructions === 'CLEAR_THREAD_INSTRUCTION') {
    dispatch(clearChat({ chat }));
  } else {
    dispatch(addNewMessage({
      message,
      chat
    }));
    dispatch(socket_sendMessage(chat, message, instructions));
    // update the message to the DB
    if (instructions === 'CLEAR_THREAD_INSTRUCTION') {
      chat && clearConversation({ chat });
    } else chat && addMessageToChat({
      message,
      chat
    }).then(() => console.log('Message updated in DB'));
  }
}

export const translateOutgoingMessage = (chat: Chat, message: Message, language: string) => (dispatch: AppDispatch) => {
  translateMessage({ message, language })
    .then(res => {
      message.text = res;
      dispatch(sendMessage(chat, message));
    }, (err) => {
      dispatch(sendMessage(chat, message));
    });
}

const translateMessage = ({ message, language }: { message: Message, language: string }): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
      socket.emit('send_message_ai', { message, language }, (res: string) => {
          resolve(res)
      });
  })
}