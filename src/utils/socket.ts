import { io } from 'socket.io-client';
import { User } from '../store/UserSlice';

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
const URL = process.env.REACT_APP_SOCKET_ENDPOINT as string;

export let socket = io(URL, {
    autoConnect: false
});

export const connectSocket = (user?: User) => {
    if (socket) {
        socket.disconnect();
    }
    socket = io(URL, {
        autoConnect: false
    });
    if (user) socket.auth = { 
        userId: user.id,
        assistantId: user.assistantId,
        threadId: user.threadId
       };
    return socket.connect();
}