import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { IoSendSharp } from "react-icons/io5";
import { IoChevronBack } from "react-icons/io5";
import { getUniqueID } from '../utils/uid';
import { Tool as ITool, Message as IMessage, initialiseTool, sendMessage, updateMessageReadStatus } from '../store/ToolsSlice';
import Message from '../chat/Message';
import Typing from '../chat/Typing';

let didInit = false;
export type AssistantPrompt = {
    id: number,
    prompt: string,
    instructions?: string
}

const Tool = () => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [messageLoading, setMessageLoading] = useState<boolean>(false);
    const [showIsTyping, setShowIsTyping] = useState<boolean>(false);

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: AppState) => state.user);
    const tool = useSelector((state: AppState) => state.toolsSlice.tools.find(f => f.isCurrentTool)) as ITool;
    const messages = tool?.messages;
    const messageRef = useRef<any>(null);

    const focusLastMessage = () => {
        const msgs = messageRef.current?.querySelectorAll('li');
        if (!msgs) return;
        const node = msgs[msgs.length - 1];
        node?.scrollIntoView({
            behavior: 'instant',
            block: 'nearest',
            inline: 'center'
        });
    }

    const getNewMessage = (): IMessage => {
        return {
            id: getUniqueID(),
            text: inputMessage,
            time: new Date().toString(),
            senderId: tool?.senderId,
            recipientId: tool?.recipientId,
        }
    }
    const handleSendMessage = async () => {
        if (!messageLoading && inputMessage.trim() !== '') {
            setMessageLoading(true);
            const newMessage = getNewMessage();
            dispatch(sendMessage(tool, newMessage))
            setInputMessage('');
            setMessageLoading(false);
            if (tool?.recipientId !== user.id) setShowIsTyping(true);
            }
        };
    const handleKeyPressEvent = (e: React.KeyboardEvent) => {
        if (!e.shiftKey && e.code === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    }

    useEffect(() => {
        const lastMessage = tool?.messages?.[tool?.messages.length - 1];
        if (lastMessage?.senderId !== user.id) setShowIsTyping(false);
        focusLastMessage();
    }, [tool?.messages, user.id]);

    useEffect(() => {
            if (!didInit) {
                didInit = true;
               if (!tool?.messages?.length) dispatch(initialiseTool(tool, user));
            }
    }, []);

    useEffect(() => {
        if (tool?.unreadMessageCount && tool.unreadMessageCount > 0) dispatch(updateMessageReadStatus({tool}));
    }, [tool, dispatch])

    return (
        <div className="flex flex-col h-screen overflow-hidden relative">
            <div className="flex flex-col absolute w-full">
                <header className="flex justify-center items-center p-4 relative sticky top-0 z-40 w-full 
                backdrop-blur-lg flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-200/85 supports-backdrop-blur:bg-slate-100/85 dark:bg-slate-900/75">
                    <div className="cursor-pointer absolute left-1 h-14 w-10 grid place-items-center text-3xl text-slate-900 dark:text-white" onClick={() => navigate('/tools')}>
                        <IoChevronBack />
                    </div>
                    {tool && <div className="text-xl font-bold text-slate-900 dark:text-emerald-400">{tool.recipientName}</div>}
                    <div></div>
                </header>
            </div>
            <div className="flex-grow overflow-y-auto messages">
                <div className="p-4 mt-12">
                    <ul ref={messageRef}>
                        {messages?.map((message) => <Message message={message} user={user} chat={tool} />)}
                        {showIsTyping && <Typing />}
                    </ul>
                </div>
            </div>
            <div className="chat-input p-4 flex items-center text-black absolute bottom-0 w-full backdrop-blur bg-slate-200/85 dark:bg-slate-900/75">
                {/* {/* displayAssistantWidget && * /
                    <div className='cursor-pointer assistant h-10 w-10 grid place-items-center text-2xl z-30'
                        onClick={toggleAssistant}
                    >
                        <SiGoogleassistant />
                    </div>} */}
                <textarea rows={1}
                    className="flex-grow border rounded-full px-4 py-2"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPressEvent}
                />
                {<div onClick={handleSendMessage} className="cursor-pointer absolute right-4 h-10 w-10 grid place-items-center text-2xl">
                    <IoSendSharp className={messageLoading ? 'text-slate-600' : ''} />
                </div>}

            </div>
            {/* {<div className={`screen bg-slate-400/70 dark:bg-slate-900/70 absolute h-fit h-screen screen w-full transition duration-500 backdrop-blur ${showAssistant ? 'z-10 opacity-100' : '-z-10 opacity-0'}`} ></div>} */}
        </div>
    );
};

export default Tool;
