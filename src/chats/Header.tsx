import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../store/store";
import { IoAddCircleOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { setCurrentChat, addChat, Chat } from "../store/ChatsSlice";
import { useNavigate } from "react-router-dom";
import { addChatToIndexedDB } from "../utils/indexedDB";
import { socket } from "../utils/socket";
type SearchResult = {
    name: string,
    id: string,
    socketId: string
}

const Header = () => {
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chats = useSelector((state: AppState) => state.chatsSlice.chats);
    const user = useSelector((state: AppState) => state.user);
    const searchInputRef = useRef<any>(null);

    useEffect(() => {
        if (showSearchInput) searchInputRef.current.focus();
    }, [showSearchInput])

    const saveChattoDB = (chat: Chat) => {
        addChatToIndexedDB(chat)
            .then(() => {
                console.log('User saved to IndexedDB');
            })
            .catch(error => {
                console.error('Error saving user to IndexedDB:', error);
            });
    }

    const handleToggleSearchInput = () => {
        setShowSearchInput(!showSearchInput);
    };

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



    return (
        <>
            <div className="flex flex-col relative">
                <header className="flex justify-between items-center text-white p-4 relative sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white supports-backdrop-blur:bg-white/95 dark:bg-slate-900/75">
                    <div className="text-xl font-bold">Chats</div>
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
        </>
    )
}

export default Header;