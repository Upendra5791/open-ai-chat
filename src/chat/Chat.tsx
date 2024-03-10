import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { Message, addNewMessage, updateMessageReadStatus } from '../store/ChatsSlice';
import { socket } from '../utils/socket';
import { addMessageToChat, resetUnreadMessageCount } from '../utils/indexedDB';
import { IoSendSharp } from "react-icons/io5";
import { IoChevronBack } from "react-icons/io5";
import { SiGoogleassistant } from "react-icons/si";
import AssistantWidget from './AssistantWidget';

const DEFAULT_AI_SENDER_ID = 'open-ai-v1';

const Chat = () => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [showAssistant, setShowAssistant] = useState<boolean>(false);
    const [messageLoading, setMessageLoading] = useState<boolean>(false);
    const [showIsTyping, setShowIsTyping] = useState<boolean>(false);
    const [translate, setTranslate] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>('');
    const [assistantClass, setAssistantClass] = useState<string>('chat-assistant');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const chat = useSelector((state: AppState) => state.chatsSlice.chats.find(f => f.isCurrentChat));
    const messages = chat?.messages;
    const messageRef = useRef<any>(null);
    const displayAssistantWidget = chat?.recipientId !== DEFAULT_AI_SENDER_ID;

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

    const updateUnreadMessageCount = () => {
        if (chat) {
            dispatch(updateMessageReadStatus({ chat }));
            resetUnreadMessageCount(chat);
        }
    }

    useEffect(() => {
        if (chat?.messages?.[chat?.messages.length - 1]?.senderId !== user.id) setShowIsTyping(false);
        focusLastMessage();
        updateUnreadMessageCount();
    }, [chat?.messages])

    useEffect(() => {
        setAssistantClass('chat-assistant show pop');
        updateUnreadMessageCount();
    }, [])

    useEffect(() => {
        if (showAssistant) {
            setAssistantClass('chat-assistant show pop');
        } else {
            setAssistantClass('chat-assistant pop');
        }
    }, [showAssistant])

    const sendMessage = (newMessage: Message) => {
        chat && dispatch(addNewMessage({
            message: newMessage,
            chat: chat
        }));
        socket.emit('send_message', {
            senderId: chat?.senderId,
            recipientId: chat?.recipientId,
            message: newMessage
        });
        setInputMessage('');
        setMessageLoading(false);
        if (chat?.recipientId === DEFAULT_AI_SENDER_ID) setShowIsTyping(true);
        // update the message to the DB
        chat && addMessageToChat({
            chat: chat,
            message: newMessage
        }).then(() => console.log('Message updated in DB'));
    }

    const handleSendMessage = async () => {
        if (!messageLoading && inputMessage.trim() !== '') {
            setMessageLoading(true);
            const newMessage: Message = {
                text: inputMessage,
                time: new Date().toString(),
                senderId: chat?.senderId,
                recipientId: chat?.recipientId,
            }
            if (translate && language) {
                // do the assistant operation then update the message
                socket.emit('send_message_ai', { message: newMessage, language }, (res: string) => {
                    if (res.includes('Unable to Translate')) {
                        alert('Unable to Translate');
                    } else {
                        newMessage.text = res;
                    }
                    sendMessage(newMessage);
                });
            } else sendMessage(newMessage);
        }
    };

    const isMessageSelf = (message: Message) => {
        return (message.senderId === user.id);
    }

    const getInitial = (message: Message) => {
        const name = isMessageSelf(message) ? user.name : chat?.recipientName
        return name?.charAt(0).toUpperCase();
    }

    const getDisplayTime = (inputDate: string) => {
        const date = new Date(inputDate);
        let hour = date.getHours();
        const min = date.getMinutes();
        const meridiam = hour < 12 ? 'am' : 'pm';
        hour = hour % 12 || 12;
        return `${hour}:${String(min).padStart(2, '0')} ${meridiam} `
    }

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

    const getChatHtml = (text: string) => {
        return {
            __html: text
        }
    }

    return (
        <div className="flex flex-col h-screen" onClick={hideAssistant}>
            <div className="flex flex-col absolute w-full">
                <header className="flex justify-center items-center p-4 relative sticky top-0 z-40 w-full 
                backdrop-blur-lg flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-100/85 supports-backdrop-blur:bg-slate-100/85 dark:bg-slate-900/75">
                    <div className="cursor-pointer absolute left-1 h-14 w-10 grid place-items-center text-3xl text-slate-900 dark:text-white" onClick={() => navigate('/chats')}>
                        <IoChevronBack />
                    </div>
                    {chat && <div className="text-xl font-bold text-slate-900 dark:text-white">{chat.recipientName}</div>}
                    <div></div>
                </header>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="p-4 mt-12">
                    <ul ref={messageRef}>
                        {messages?.map((message, index) => {
                            let contClass = isMessageSelf(message) ? 'justify-self-end justify-end sender' : 'justify-self-start justify-start reciever';
                            contClass += ' flex w-full'
                            return (
                                <li key={message.time}
                                    className="grid justify-items-stretch mb-2">
                                    <div className={contClass}>
                                        {/* {!isMessageSelf(message) && <div className='sender-indicator rounded-full bg-slate-800 self-end mr-2 text-white'>
                                            <p className='text-xs'>{getInitial(message)}</p>
                                        </div>} */}
                                        <div className="chat-message rounded-lg p-3 max-w-[85%] text-sm relative">
                                            <div className='whitespace-pre text-wrap text-slate-100'
                                                dangerouslySetInnerHTML={getChatHtml(message.text)}></div>
                                            <p className='text-xs text-gray-400 text-right'>{getDisplayTime(message.time)}</p>
                                        </div>
                                       {/*  {isMessageSelf(message) && <div className='sender-indicator rounded-full bg-slate-800 self-end ml-2 text-white'>
                                            <p className='text-xs'>{getInitial(message)}</p>
                                        </div>} */}
                                    </div>
                                </li>
                            )
                        })}
                        {showIsTyping && <li key='message-loading' className='grid justify-items-stretch mb-2'>
                            <div className='justify-self-start justify-start reciever flex w-full'>
                                <div className="chat-message rounded-lg p-2 max-w-[85%] text-sm relative">
                                    <div className='relative text-transparent z-10'>
                                    . .eee.
                                    <span className='ball bg-slate-100 '></span>
                                   <span className='ball bg-slate-100'></span>
                                   <span className='ball bg-slate-100'></span>
                                    </div>
                                   
                                </div>
                            </div>
                        </li>}
                    </ul>
                </div>
            </div>
            <div className="chat-input p-4 pb-5 flex items-center text-black relative">
                {displayAssistantWidget &&
                    <div className='cursor-pointer assistant h-10 w-10 grid place-items-center text-2xl'
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

            {displayAssistantWidget &&
                <AssistantWidget
                    assistantClass={assistantClass}
                    language={language}
                    translate={translate}
                    setTranslate={setTranslate}
                    expandAssistant={expandAssistant}
                    setLanguage={setLanguage}
                />
            }
        </div>
    );
};

export default Chat;
