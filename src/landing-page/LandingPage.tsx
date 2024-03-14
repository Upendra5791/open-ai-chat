import { useEffect, useState } from 'react';
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
    const [showError, setshowError] = useState<boolean>(false);
    const [userChecked, setUserChecked] = useState<boolean>(false);
    const uniqueID = useUniqueId(userName);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const [loading, setLoading] = useState(false);

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
        socket.auth = { userId: user.id };
        socket.connect();
        socket.emit('chat_register', user, (response: any) => {
            console.log(response.message);
            setLoading(false);
            if (response.status === 0) {
                const newUser = {
                    name: userName,
                    id: uniqueID,
                    socketId: response.socketId
                }
                saveUser(newUser)
            } else if (response.status === 3) {
                setshowError(true);
            }
        });
    }

    useEffect(() => {
        if (!!user && !!Object.keys(user).length) {
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
        setLoading(true);
        registerChatToSocket(user);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
        setshowError(false);
    }

    const errorClass = (): string => {
        return showError ? 'error show mt-8 absolute bottom-4' : 'error mt-8 absolute bottom-4';
    }

    return (
        <>
            {userChecked && 
             <div className='register-screen min-h-screen flex flex-col items-center justify-center relative bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-950'>
               <div className={`absolute h-screen w-full bg-slate-900 opacity-0 transition duration-1000 ${loading ? 'opacity-100 z-40': ''}`}></div> 
                {/* <h1 className="text-4xl font-bold mb-8">Fun Chat</h1> */}
                <div className='form-input flex flex-col items-center justify-center w-80 h-80 relative overflow-hidden '>
                    <div className='username-cont relative'>
                    <input
                        type="text"
                        value={userName}
                        onChange={handleInputChange}
                        className="username px-4 py-2 mb-4 text-white"
                        placeholder="Enter your user name"
                    />
                    <span className='custom-border'></span>
                    </div>
                    <button
                        className="register bg-transparent border-2 hover:bg-green-400 border-green-400 text-white py-2 px-6 rounded-full"
                        onClick={handleRegisterClick}
                    >
                        Register
                    </button>

                    <div className={errorClass()}>
                        <p className='text-red-500'>Sorry, user name {userName} is already taken!</p>
                    </div>
                </div>

            </div>}
        </>
    );
};

export default LandingPage;
