import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './landing-page/LandingPage';
import Chats from './chats/Chats';
import Chat from './chat/Chat';
import { useDispatch, useSelector } from 'react-redux';
import { User, updateUser } from './store/UserSlice';
import { socket } from './utils/socket';
import { SocketMessageHandler } from './SocketMessageHandler';
import { addChatToIndexedDB, getChatsFromIndexedDB, getUserFromIndexedDB } from './utils/indexedDB';
import { AppState } from './store/store';
import { addChat } from './store/ChatsSlice';
import ProtectedRoute from './ProtectedRoute';
import {Chat as IChat} from './store/ChatsSlice';

const DEFAULT_AI_CHAT_ID = 'ai-chat';
const DEFAULT_AI_SENDER_ID = 'open-ai-v1';
/* const initialAIMessage = (userName: string) => ({
  text: `Hi ${userName}, how can I assist you?`,
  time: new Date().toString(),
  senderId: DEFAULT_AI_SENDER_ID,
  recipientId: ''
}); */

function App() {
  // const [socket, setSocket] = useState<Socket>();
  const user = useSelector((state: AppState) => state.user);
  // const user = useGetUserFromIndexedDB();
  const dispatch = useDispatch();
  
  // if new user detected in app state connect to socket and register the user to the socket
  useEffect(() => {
    if (!!user && !!Object.keys(user).length) {
      // dispatch(updateUser(user));
      if (socket.disconnected) socket.connect();
      socket?.emit('chat_register', user, (response: any) => {
        console.log(response.message);
        if (response.status === 0) {
          console.log('User registered with new Socket');
        }
      });
    }
  }, [user]);

  useEffect(() => {
    getUserFromIndexedDB()
      .then((users: User[]) => {
        if (users.length) {
          console.log('User retrieved from IndexedDB:', users[0]);
          dispatch(updateUser(users[0]));
        }
      })
      .catch(error => {
        console.error('Error retrieving user from IndexedDB:', error);
      });

    /*   () => {
        return socket.disconnect();
      } */

  }, []);

  // retrieve chats from DB and update the app state. If chat assistant not present in chats add that as well.
  useEffect(() => {
    if (!!Object.keys(user).length) {
      getChatsFromIndexedDB()
        .then((chatsInDB: IChat[]) => {
          // const AIChatPresentinDB =  chatsInDB.some((chat) => chat.id === DEFAULT_AI_CHAT_ID);
          // const newInitMessage = initialAIMessage(user.name);
          // const updatedAIChat = {
          //   ...aiChatInit,
          //   messages: [],
          //   senderId: user.id
          // }
          let newChatList: IChat[] = [...chatsInDB]
          // if (!AIChatPresentinDB) newChatList = [updatedAIChat, ...newChatList];
          console.log('Chats retrieved from IndexedDB:', chatsInDB);
          newChatList.forEach((chat: any) => {
            dispatch(addChat(chat));
          });
          // if (!chatsInDB.length) {
          //   updateAIChatToDB(updatedAIChat);
          // }
        });
    }
  }, [user]);

  return (
    <>
    <div className='absolute flex space-between z-50'>
    <button onClick={() => socket.connect()} className='bg-blue-500 rounded mx-2 p-1 text-sm'> Connect </button>
    <button onClick={() => socket.disconnect()} className='bg-blue-500 rounded mx-2 p-1 text-sm'> Disconnect </button>
    </div>
    
      {socket && <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/chats" element={<Chats />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

        </Routes>
      </BrowserRouter>}
      <SocketMessageHandler />
    </>
  );
}

export default App;
