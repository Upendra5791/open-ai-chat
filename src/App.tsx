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
import { getChatsFromIndexedDB, getUserFromIndexedDB } from './utils/indexedDB';
import { AppState } from './store/store';
import { addChat } from './store/ChatsSlice';
import ProtectedRoute from './ProtectedRoute';
import { Chat as IChat } from './store/ChatsSlice';

function App() {
  const user = useSelector((state: AppState) => state.user);
  const dispatch = useDispatch();

  // if new user detected in app state connect to socket and register the user to the socket
  const connectUserToSocket = () => {
    if (socket.disconnected) {
      socket.auth = { userId: user.id };
      socket.connect();
    }
    socket?.emit('socket_check', user, (response: any) => {
      console.log(response.message);
      if (response.status === 0) {
        console.log('User registered with new Socket');
      }
    });
  }

  // retrieve chats from DB and update the app state.
  const getChats = () => {
    getChatsFromIndexedDB()
      .then((chatsInDB: IChat[]) => {
        console.log('Chats retrieved from IndexedDB:', chatsInDB);
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
  const getUser = () => {
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
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (!!user && !!Object.keys(user).length) {
      connectUserToSocket();
      getChats();
    }
  }, [user]);

  return (
    <>
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
          </Route>

        </Routes>
      </BrowserRouter>}
      <SocketMessageHandler />
    </>
  );
}

export default App;
