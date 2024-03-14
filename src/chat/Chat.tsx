import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { Chat as IChat, Message as IMessage, addNewMessage, clearChat, updateMessageReadStatus } from '../store/ChatsSlice';
import { socket } from '../utils/socket';
import { addMessageToChat, clearConversation, resetUnreadMessageCount } from '../utils/indexedDB';
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
    const dispatch = useDispatch();
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

    const updateUnreadMessageCount = () => {
        if (chat) {
            dispatch(updateMessageReadStatus({ chat }));
            resetUnreadMessageCount(chat);
        }
    }

    useEffect(() => {
        const lastMessage = chat?.messages?.[chat?.messages.length - 1];
        // if (translateIncoming && incomingLanguage && lastMessage?.senderId !== user.id) {
        //      translateMessage({message: lastMessage, language: incomingLanguage})
        //      .then(res => {
        //         console.log(res)
        //      })
        // }
        if (lastMessage?.senderId !== user.id) setShowIsTyping(false);
        focusLastMessage();
        updateUnreadMessageCount();
    }, [chat?.messages])

    useEffect(() => {
        updateUnreadMessageCount();
    }, [])

    const sendMessage = (newMessage: IMessage, instructions?: string) => {
        if (instructions === 'CLEAR_THREAD_INSTRUCTION') {
            dispatch(clearChat({ chat }));
        } else {
            chat && dispatch(addNewMessage({
                message: newMessage,
                chat: chat
            }));
        }
        if (!socket.connected) socket.connect();
        socket.emit('send_message', {
            senderId: chat?.senderId,
            recipientId: chat?.recipientId,
            message: newMessage,
            instructions
        });
        setInputMessage('');
        setMessageLoading(false);
        if (chat?.recipientId === DEFAULT_AI_SENDER_ID) setShowIsTyping(true);
        // update the message to the DB
        if (instructions === 'CLEAR_THREAD_INSTRUCTION') {
            chat && clearConversation({ chat });
        } else chat && addMessageToChat({
            chat: chat,
            message: newMessage
        }).then(() => console.log('Message updated in DB'));
    }

    const translateMessage = ({ message, language }: { message: IMessage, language: string }): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            socket.emit('send_message_ai', { message, language }, (res: string) => {
                resolve(res)
            });
        })
    }

    const handleSendMessage = async () => {
        if (!messageLoading && inputMessage.trim() !== '') {
            setMessageLoading(true);
            const newMessage: IMessage = {
                id: getUniqueID(),
                text: inputMessage,
                time: new Date().toString(),
                senderId: chat?.senderId,
                recipientId: chat?.recipientId,
            }
            if (translateOutgoing && outgoingLanguage) {
                // do the assistant operation then update the message
                translateMessage({ message: newMessage, language: outgoingLanguage })
                    .then(res => {
                        newMessage.text = res;
                        sendMessage(newMessage);
                    }, (err) => {
                        sendMessage(newMessage);
                    });
            } else sendMessage(newMessage);
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
        sendMessage(newMessage, p.instructions);
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
                        {messages?.map((message) => <Message message={message} user={user} chat={chat} />)}
                        {showIsTyping && <Typing />}
                    </ul>
                </div>
            </div>
            <div className="chat-input p-4 flex items-center text-black relative">
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

                {isAssistantChat && <AssistantPrompts
                    showAssistant={showAssistant}
                    selectPrompt={selectPrompt} />}

            </div>

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

            {<div className={`screen bg-slate-700/80 absolute h-fit h-screen screen w-full transition duration-500 ${showAssistant ? 'z-10 opacity-100' : '-z-10 opacity-0'}`} ></div>}
        </div>
    );
};

export default Chat;
