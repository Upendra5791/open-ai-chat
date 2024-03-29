import { useEffect } from "react";
import { socket } from "./utils/socket";
import { Chat, RecieveMessageResponse, addChat, addNewMessage } from "./store/ChatsSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "./store/store";
import { addChatToIndexedDB, addMessageToChat, updateUserToIndexedDB } from "./utils/indexedDB";
import { Assistant, updateUser } from "./store/UserSlice";
// const DEFAULT_AI_CHAT_ID = 'ai-chat';
const DEFAULT_AI_SENDER_ID = 'open-ai-v1';

export const SocketMessageHandler = () => {

    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const chats = useSelector((state: AppState) => state.chatsSlice.chats);

/*     const greetUser = () => {
        if (!!user && !!Object.keys(user).length) {
            socket.emit('greet_user', {
                senderId: user.id,
                recipientId: DEFAULT_AI_SENDER_ID,
                user: user
            });
        }
    } */

    // useEffect(() => {
    //     // when user is first added to state greet user to initiate Assistant
    //     greetUser()
    // }, [user]);

    const addMessageToDB = () => {

    }

    useEffect(() => {
        const onConnect = () => {
          console.log('Socket Connected!', socket.id);
        //   socket?.emit('chat_register', user, (response: any) => {
        //     console.log(response.message);
        //     if (response.status === 0) {
        //       console.log('User registered with new Socket');
        //     }
        //   });
        }
        const onDisconnect = (e: any) => {
          console.log('Socket Disconnected! ', e);
          socket.connect();
        //   window.location.href = '';
        }
        const handleReceiveMessage = (response: RecieveMessageResponse) => {
            const existingChat = chats.find(f => f.recipientId === response.sender.id);
            if (!!existingChat) {
                dispatch(addNewMessage({
                    message: response.message,
                    chat: existingChat
                }));
                const newMsgCount = !existingChat.unreadMessageCount ? 1 : existingChat.unreadMessageCount+1;
                existingChat && addMessageToChat({
                    chat: {
                        ...existingChat,
                        unreadMessageCount: newMsgCount
                    },
                    message: response.message,
                }).then(() => console.log('Message updated in DB'));
            } else {
                const newChat: Chat = {
                    id: response.sender.id,
                    senderId: user.id,
                    recipientId: response.sender.id,
                    recipientName: response.sender.name,
                    socketId: response.sender.socketId,
                    messages: [response.message],
                    unreadMessageCount: 1
                };
                dispatch(addChat(newChat));
                addChatToIndexedDB(newChat)
                    .then(() => {
                        console.log('Chat added to IndexedDB!');
                    })
                    .catch(error => {
                        console.error('Error saving user to IndexedDB:', error);
                    });

            }
        }
        const handleAssistantUpdate = (assistant: Assistant) => {
            const updatedUser = {
                ...user,
                assistantId: assistant.assistantId,
                threadId: assistant.threadId
            };
            updateUserToIndexedDB(updatedUser)
            .then(() => {
                console.log('User saved to IndexedDB');
                dispatch(updateUser(updatedUser));
            })
            .catch((error: any) => {
                console.error('Error saving user to IndexedDB:', error);
            });
        } 
    
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_message', handleReceiveMessage);
        socket.on('assistant_update', handleAssistantUpdate);
        // only for dev
        socket.onAny((eventName, ...args) => {
           console.log(eventName, socket);
          });
        return () => {
          console.log('SocketMessageHandler unsubscribe');
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('receive_message', handleReceiveMessage);
          socket.off('assistant_update', handleAssistantUpdate);
        };
      }, [chats, user, dispatch]);

return (<></>);
}