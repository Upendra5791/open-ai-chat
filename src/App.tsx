import { useEffect, useRef } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './landing-page/LandingPage';
import Chats from './chats/Chats';
import Chat from './chat/Chat';
import { useDispatch, useSelector } from 'react-redux';
import { User, updateUser } from './store/UserSlice';
import { socket } from './utils/socket';
import { SocketMessageHandler } from './SocketMessageHandler';
import { getChatsFromIndexedDB, getUserFromIndexedDB } from './utils/indexedDB';
import { getUser } from './store/UserSlice';
import { addChat } from './store/ChatsSlice';
import ProtectedRoute from './ProtectedRoute';
import { Chat as IChat } from './store/ChatsSlice';
import { AppState } from './store/store';
import Settings from './settings/Settings';

function App() {
  const user = useSelector((state: AppState) => getUser(state));
  const dispatch = useDispatch();
  const intervalRef = useRef< NodeJS.Timer>();

  // if new user detected in app state connect to socket and register the user to the socket
  const connectUserToSocket = () => {
    if (socket.disconnected) {
      socket.auth = { 
        userId: user.id,
        assistantId: user.assistantId,
        threadId: user.threadId
       };
      socket.connect();
      socket?.emit('socket_check', user, (response: any) => {
        if (response.status === 0) {
          console.log('User registered with new Socket', socket.id);
        }
      });
    }
  }

  const pingServer = (): NodeJS.Timer => {
    return setInterval(() => {
      if (socket.disconnected) socket.connect();
        socket?.emit('client_ping', user, (response: any) => {
          if (response.status === 0) {
            console.log(response.message, socket.id);
          }
        });
    }, 5000);
  }

  // retrieve chats from DB and update the app state.
  const getChats = () => {
    getChatsFromIndexedDB()
      .then((chatsInDB: IChat[]) => {
        chatsInDB?.forEach((chat: any) => {
          dispatch(addChat(chat));
        });
        if (!chatsInDB?.length) greetUser();
      });
  }

  const DEFAULT_AI_SENDER_ID = 'open-ai-v1';
  const greetUser = () => {
    if (!!user && !!Object.keys(user).length) {
      socket.emit('greet_user', {
        senderId: user.id,
        recipientId: DEFAULT_AI_SENDER_ID,
        user: user
      });
    }
  }

  // retrieve the user from DB and update the app state.
  const fetchUser = () => {
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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!!user && !!Object.keys(user).length) {
      connectUserToSocket();
      getChats();
      // intervalRef.current = pingServer();
    }
    // return () => {
    //   clearInterval(intervalRef.current);
    // }
  }, [user?.id]);

  return (
    <div className='text-slate-900 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 overflow-hidden'>
      {/*       <div className='absolute flex space-between z-50'>
        <button onClick={() => socket.connect()} className='bg-blue-500 rounded mx-2 p-1 text-sm'> Connect </button>
        <button onClick={() => socket.disconnect()} className='bg-blue-500 rounded mx-2 p-1 text-sm'> Disconnect </button>
      </div> */}

      {socket && <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/chats" element={<Chats />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

        </Routes>
      </BrowserRouter>}
      <SocketMessageHandler />
    </div>
  );
}

export default App;
