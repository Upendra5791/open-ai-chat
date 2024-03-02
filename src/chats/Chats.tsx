import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { Chat, addChat, aiChatInit, setCurrentChat } from '../store/ChatsSlice';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';
import { addChatToIndexedDB, getChatFromIndexedDB } from '../utils/indexedDB';
import { User } from '../store/UserSlice';
import { IoAddCircleOutline } from "react-icons/io5";

type SearchResult = {
    name: string,
    id: string,
    socketId: string
}
const Chats = () => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chats = useSelector((state: AppState) => state.chatsSlice.chats);
    const user = useSelector((state: AppState) => state.user);
    const searchInputRef = useRef<any>(null);

    useEffect(() => {
        // initializeAIChat();
    }, [])

    const initializeAIChat = async () => {
        // if (!!user && Object.keys(user).length) {
        const aiChat = chats?.find(f => f.id === 'ai-chat');
        if (!aiChat) {
            dispatch(addChat(aiChatInit));
        }
        const aiChatinDB = aiChat && await getChatFromIndexedDB(aiChat);
        if (aiChat && !aiChatinDB) {
            saveChattoDB(aiChat);
        }
        // }
    }

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
        if (event.target.value.length) {
            socket.emit('search', event.target.value, ((response: any) => {
                if (!!response) {
                    setSearchResults(response.results.filter((f: any) => f.id !== user.id));
                }
            }));
        } else {
            setSearchResults([]);
        }
    };

    const handleClearSearch = () => {
        setShowSearchInput(false);
        setSearchText('');
        setSearchResults([]);
    };

    const handleToggleSearchInput = () => {
        setShowSearchInput(!showSearchInput);
    };

    useEffect(() => {
        if (showSearchInput) searchInputRef.current.focus();
    }, [showSearchInput])

    const saveChattoDB = (chat: Chat) => {
        addChatToIndexedDB(chat)
            .then(() => {
                console.log('User saved to IndexedDB');
                // Dispatch updateUser action
            })
            .catch(error => {
                console.error('Error saving user to IndexedDB:', error);
            });
    }

    const handleSearchResultsClick = async (result: SearchResult) => {
        if (chats.find((f: Chat) => f.id === result.id)) {
            dispatch(setCurrentChat(result.id));
        } else {
            const newChat: Chat = {
                id: result.id,
                senderId: user.id,
                recipientId: result.id,
                recipientName: result.name,
                socketId: result.socketId,
                messages: [],
                isCurrentChat: true
            };
            dispatch(addChat(newChat));
            dispatch(setCurrentChat(result.id));
            saveChattoDB(newChat);
        }
        navigate('/chat');
    }

    const navigateToChat = (chat: Chat) => {
        dispatch(setCurrentChat(chat.recipientId));
        navigate('/chat');
    }

    const getDisplayTime = (inputDate: string) => {
        if (inputDate) {
            const date = new Date(inputDate);
            let hour = date.getHours();
            const min = date.getMinutes();
            const meridiam = hour < 12 ? 'am' : 'pm';
            hour = hour % 12 || 12;
            return `${hour}:${String(min).padStart(2, '0')} ${meridiam} `
        } else return '';

    }

    /*     const showUnreadMsgCount = (chat: Chat) => {
            const count = chat.messages.filter(f => !f.read).length || '';
            return !!count ?
                <div className='msg-count h-5 w-5 grid place-items-center text-xs text-white rounded-full bg-green-500'>
                    {showUnreadMsgCount(chat)}
                </div>
                : null
        } */

    const showUnreadMsgCount = (chat: Chat) => {
        return chat.messages.filter(f => !f.read).length || '';
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-col relative">
                <header className="flex justify-between items-center text-white p-4 relative sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white supports-backdrop-blur:bg-white/95 dark:bg-slate-900/75">
                    <div className="text-xl font-bold">Chats</div>
                    {/* {user && <div className="text-l font-bold">{user?.name}</div>} */}
                    {/* <button className="text-xl text-white" onClick={handleToggleSearchInput}>
                        +
                    </button> */}
                    <div onClick={handleToggleSearchInput} className=' cursor-pointer h-8 w-8 grid place-items-center text-3xl text-white'>
                        <IoAddCircleOutline />
                    </div>
                    {showSearchInput && (
                        <div className="new-search-bar absolute text-right">
                            <input
                                ref={searchInputRef}
                                type="text"
                                id="searchUser"
                                placeholder="Search user"
                                className={'w-full px-4 py-2 rounded-full focus:outline-none focus:ring focus:border-blue-300 text-white'}
                                value={searchText}
                                onChange={handleSearchInputChange}
                            />
                            {/* <button
                                className="close absolute right-3 text-l text-slate-300"
                                onClick={handleClearSearch}
                            >
                                x
                            </button> */}
                            <div onClick={handleClearSearch}
                                className='cursor-pointer h-10 w-10 close absolute right-1 grid place-items-center text-3xl text-white'>
                                <IoAddCircleOutline />
                            </div>

                        </div>
                    )}
                </header>
            </div>
            {showSearchInput && (
                <div className="search-results absolute top-full bg-white w-full shadow-lg h-fit">
                    {searchResults.map((result, index) => (
                        <div key={index} onClick={() => handleSearchResultsClick(result)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-900">
                            {result.name}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex-1 overflow-y-auto">
                <div className="chats-container divide-y ">
                    {chats?.map((chat: Chat) => {
                        // Get the latest message
                        const latestMessage = chat.messages[chat.messages.length - 1];
                        return (
                            <div onClick={() => navigateToChat(chat)}
                                className=" cursor-pointer chat py-2 px-3 border-top border-slate-600 border-b-[1px]" key={chat.id}>
                                <div className="flex justify-between items-center">
                                    <div className="rec-name text-white">{chat.recipientName}</div>
                                    <div className="text-sm text-gray-500">{getDisplayTime(latestMessage?.time)}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="message text-sm text-gray-200 text-ellipsis text-nowrap overflow-hidden">{latestMessage?.text}</div>
                                    {/* {!!showUnreadMsgCount(chat) ? 
                                    <div className='msg-count h-5 w-5 grid place-items-center text-xs text-white rounded-full bg-green-500'>
                                        {showUnreadMsgCount(chat)}
                                    </div>
                                        : null} */}
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
        </div>
    );
};

export default Chats;
