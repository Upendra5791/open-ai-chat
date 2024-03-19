import { useDispatch, useSelector } from "react-redux";
import Footer from "../chats/Footer";
import { AppState } from "../store/store";
import getDisplayTime from "../utils/displayTime";
import { useNavigate } from "react-router-dom";
import { Tool, setCurrentTool } from "../store/ToolsSlice";
import Header from "./Header";
import { useEffect } from "react";
import { setCurrentChat } from "../store/ChatsSlice";
const DEFAULT_AI_SENDER_ID = 'open-ai-v1';

const Tools = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chats = useSelector((state: AppState) => state.chatsSlice.chats);
    const tools = useSelector((state: AppState) => state.toolsSlice.tools);
    const assistantChat = chats.filter(f => f.id === DEFAULT_AI_SENDER_ID)?.[0];

    const navigateToTool = (chat: Tool) => {
        if (chat.id === DEFAULT_AI_SENDER_ID) {
            dispatch(setCurrentChat(chat.recipientId));
            navigate('/chat');
        } else {
            dispatch(setCurrentTool(chat.recipientId));
            navigate('/tool');
        }

    }

    const chatDisplay = (chat: Tool) => {
        // Get the latest message
        const latestMessage = chat.messages[chat.messages.length - 1];
        return (
            <div onClick={() => navigateToTool(chat)}
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
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 overflow-y-auto">
                <div className="chats-container divide-y ">
                    {assistantChat && chatDisplay(assistantChat)}
                    {tools?.map((tool: Tool) => chatDisplay(tool))}
                </div>

            </div>
            <Footer />
        </div>
    )
}

export default Tools;