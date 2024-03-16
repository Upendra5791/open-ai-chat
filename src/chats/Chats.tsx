import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { Chat, setCurrentChat } from '../store/ChatsSlice';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import getDisplayTime from '../utils/displayTime';

const Chats = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chats = useSelector((state: AppState) => state.chatsSlice.chats);
    const navigateToChat = (chat: Chat) => {
        dispatch(setCurrentChat(chat.recipientId));
        navigate('/chat');
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 overflow-y-auto">
                <div className="chats-container divide-y ">
                    {chats?.map((chat: Chat) => {
                        // Get the latest message
                        const latestMessage = chat.messages[chat.messages.length - 1];
                        return (
                            <div onClick={() => navigateToChat(chat)}
                                className=" cursor-pointer chat py-2 px-3 border-top border-slate-600 border-b-[1px]" key={chat.id}>
                                <div className="flex justify-between items-center">
                                    <div className="rec-name dark:text-emerald-400">{chat.recipientName}</div>
                                    <div className="text-sm text-gray-500">{getDisplayTime(latestMessage?.time)}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="message text-sm dark:text-gray-200 text-ellipsis text-nowrap overflow-hidden text-sm whitespace-nowrap">{latestMessage?.text}</div>
                                    {
                                        !!chat.unreadMessageCount && <div className='msg-count h-5 w-5 grid place-items-center text-xs text-white rounded-full bg-green-500'>
                                            {chat.unreadMessageCount}
                                        </div>
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default Chats;
