
import { Chat, Message as IMessage } from '../store/ChatsSlice';
import { User } from '../store/UserSlice';
import getDisplayTime from '../utils/displayTime';


const Message = ({
    message,
    user,
    chat
}: {
    message: IMessage,
    user: User,
    chat: Chat
}) => {


    const isMessageSelf = (message: IMessage) => {
        return (message.senderId === user.id);
    }

/*     const getInitial = (message: IMessage) => {
        const name = isMessageSelf(message) ? user.name : chat?.recipientName
        return name?.charAt(0).toUpperCase();
    } */
    const getChatHtml = (text: string) => {
        return {
            __html: text
        }
    }
    let contClass = isMessageSelf(message) ? 'justify-self-end justify-end sender' : 'justify-self-start justify-start reciever';
    contClass += ' flex w-full';

    return (
        <li key={message.id}
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
    );
}

export default Message