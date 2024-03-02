import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useUniqueId } from '../hooks/useUniqueID';
import { useNavigate } from 'react-router-dom';
import { User, updateUser } from '../store/UserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { socket } from '../utils/socket';
import { saveUserToIndexedDB } from '../utils/indexedDB';

const LandingPage = () => {
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userChecked, setUserChecked] = useState<boolean>(false);
    const uniqueID = useUniqueId(userName);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const user = useGetUserFromIndexedDB();
    const user = useSelector((state: AppState) => state.user);

    const saveUser = (newUser: User) => {
        saveUserToIndexedDB('user', newUser)
            .then(() => {
                console.log('User saved to IndexedDB');
                // Dispatch updateUser action
                dispatch(updateUser(newUser))
                // Navigate to chat page
                navigate('/chats');
            })
            .catch((error: any) => {
                console.error('Error saving user to IndexedDB:', error);
            });
    }

    const registerChatToSocket = (user: any) => {
        socket.connect();
        socket.emit('chat_register', user, (response: any) => {
            console.log(response.message);
            if (response.status === 0) {
                const newUser = {
                    name: userName,
                    id: uniqueID,
                    socketId: response.socketId
                }
                saveUser(newUser)

            }
        });
    }

    useEffect(() => {
        if (!!user && !!Object.keys(user).length) {
            dispatch(updateUser(user));
            navigate('/chats');
        } else {
            setUserChecked(true);
        }
    }, [user])

    const handleRegisterClick = () => {
        if (!userName.length) return;
        setUserId(uniqueID);
        const user = {
            id: uniqueID,
            name: userName
        }
        registerChatToSocket(user);
    };

    return (
        <>
            {userChecked && <div className="min-h-screen flex flex-col items-center justify-center">
                {/* Header */}
                <h1 className="text-4xl font-bold mb-8">Fun Chat</h1>

                {/* Input Box */}
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-70p border border-gray-300 rounded-md px-4 py-2 mb-4 text-black"
                    placeholder="Enter your name"
                />

                {/* Register Button */}
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={handleRegisterClick}
                >
                    Register
                </button>
            </div>}
        </>
    );
};

export default LandingPage;
