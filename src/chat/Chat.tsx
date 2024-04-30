import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { Chat as IChat, Message as IMessage, sendMessage, translateOutgoingMessage, updateMessageStatus } from '../store/ChatsSlice';
import { IoSendSharp } from "react-icons/io5";
import { IoChevronBack } from "react-icons/io5";
import { SiGoogleassistant } from "react-icons/si";
import AssistantWidget from './AssistantWidget';
import AssistantPrompts from './AssistantPrompts';
import Typing from './Typing';
import Message from './Message';
import { getUniqueID } from '../utils/uid';

const DEFAULT_AI_SENDER_ID = 'open-ai-v1';
export type AssistantPrompt = {
    id: number,
    prompt: string,
    instructions?: string
}

const Chat = () => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [showAssistant, setShowAssistant] = useState<boolean>(false);
    const [messageLoading, setMessageLoading] = useState<boolean>(false);
    const [showIsTyping, setShowIsTyping] = useState<boolean>(false);
    const [translateIncoming, setTranslateIncoming] = useState<boolean>(false);
    const [translateOutgoing, setTranslateOutgoing] = useState<boolean>(false);
    const [incomingLanguage, setIncomingLanguage] = useState<string>('');
    const [outgoingLanguage, setOutgoingLanguage] = useState<string>('');
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: AppState) => state.user);
    const chat = useSelector((state: AppState) => state.chatsSlice.chats.find(f => f.isCurrentChat)) as IChat;
    const messages = chat?.messages;
    const messageRef = useRef<any>(null);
    const isAssistantChat = chat?.recipientId === DEFAULT_AI_SENDER_ID;

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

    useEffect(() => {
        const lastMessage = chat?.messages?.[chat?.messages.length - 1];
        if (lastMessage?.senderId !== user.id) setShowIsTyping(false);
        focusLastMessage();
    }, [chat?.messages, user.id]);

    useEffect(() => {
        if (chat?.unreadMessageCount && chat.unreadMessageCount > 0) dispatch(updateMessageStatus(chat));
    }, [chat, dispatch])

    const getNewMessage = (): IMessage => {
        return {
            id: getUniqueID(),
            text: inputMessage,
            time: new Date().toString(),
            senderId: chat?.senderId,
            recipientId: chat?.recipientId,
        }
    }

    const handleSendMessage = async () => {
        if (!messageLoading && inputMessage.trim() !== '') {
            setMessageLoading(true);
            const newMessage = getNewMessage();
            if (translateOutgoing && outgoingLanguage) {
                dispatch(translateOutgoingMessage(chat, newMessage, outgoingLanguage))
            } else {
                dispatch(sendMessage(chat, newMessage))
            }
            setInputMessage('');
            setMessageLoading(false);
            if (chat?.recipientId === DEFAULT_AI_SENDER_ID) setShowIsTyping(true);
            }
        };

    const expandAssistant = () => {
        if (!showAssistant) setShowAssistant(true);
    }
    const clickedOnAssistant = (e: React.MouseEvent) => {
        const chatWidget = document.querySelector('.chat-assistant');
        return chatWidget?.contains(e.target as Node);
    }
    const hideAssistant = (e: React.MouseEvent) => {
        if (showAssistant && !clickedOnAssistant(e)) setShowAssistant(false);
    }
    const toggleAssistant = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowAssistant(val => !val);
    }
    const handleKeyPressEvent = (e: React.KeyboardEvent) => {
        if (!e.shiftKey && e.code === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    }

    const selectPrompt = (p: AssistantPrompt) => {
        const newMessage: IMessage = {
            id: getUniqueID(),
            text: p.prompt,
            time: new Date().toString(),
            senderId: chat?.senderId,
            recipientId: chat?.recipientId,
        }
        dispatch(sendMessage(chat, newMessage, p.instructions));
        setShowIsTyping(true);
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden relative" onClick={hideAssistant}>
            <div className="flex flex-col absolute w-full">
                <header className="flex justify-center items-center p-4 relative sticky top-0 z-40 w-full 
                backdrop-blur-lg flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-200/85 supports-backdrop-blur:bg-slate-100/85 dark:bg-slate-900/75">
                    <div className="cursor-pointer absolute left-1 h-14 w-10 grid place-items-center text-3xl text-slate-900 dark:text-white" onClick={() => navigate('/chats')}>
                        <IoChevronBack />
                    </div>
                    {chat && <div className="text-xl font-bold text-slate-900 dark:text-emerald-400">{chat.recipientName}</div>}
                    <div></div>
                </header>
            </div>
            <div className="flex-grow overflow-y-auto messages">
                <div className="p-4 mt-12">
                    <ul ref={messageRef}>
                        {messages?.map((message) => <Message message={message} user={user} chat={chat} />)}
                        {showIsTyping && <Typing />}
                    </ul>
                </div>
            </div>
            <div className="chat-input p-4 flex items-center text-black absolute bottom-0 w-full backdrop-blur bg-slate-200/85 dark:bg-slate-900/75">
                {/* displayAssistantWidget && */
                    <div className='cursor-pointer assistant h-10 w-10 grid place-items-center text-2xl z-30'
                        onClick={toggleAssistant}
                    >
                        <SiGoogleassistant />
                    </div>}
                <textarea rows={1}
                    className="flex-grow border rounded-full px-4 py-2"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPressEvent}
                />
                <div onClick={handleSendMessage} className="cursor-pointer absolute right-4 h-10 w-10 grid place-items-center text-2xl">
                    <IoSendSharp className={messageLoading ? 'text-slate-600' : ''} />
                </div>

            </div>

            {isAssistantChat && <AssistantPrompts
                    showAssistant={showAssistant}
                    selectPrompt={selectPrompt} />}

            {!isAssistantChat &&
                <AssistantWidget
                    showAssistant={showAssistant}
                    expandAssistant={expandAssistant}
                    outgoingLanguage={outgoingLanguage}
                    setOutgoingLanguage={setOutgoingLanguage}
                    incomingLanguage={incomingLanguage}
                    setIncomingLanguage={setIncomingLanguage}
                    translateIncoming={translateIncoming}
                    setTranslateIncoming={setTranslateIncoming}
                    translateOutgoing={translateOutgoing}
                    setTranslateOutgoing={setTranslateOutgoing}

                />
            }

            {<div className={`screen bg-slate-400/70 dark:bg-slate-900/70 absolute h-fit h-screen screen w-full transition duration-500 backdrop-blur ${showAssistant ? 'z-10 opacity-100' : '-z-10 opacity-0'}`} ></div>}
        </div>
    );
};

export default Chat;
