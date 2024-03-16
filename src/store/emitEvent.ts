import { socket } from "../utils/socket";
import { Chat, Message } from "./ChatsSlice";
import { AppDispatch } from "./store";



export const socket_sendMessage = (chat: Chat, message: Message, instructions?: string) => async (dispatch: AppDispatch) => {
    if (socket.disconnected) {
        console.log('Socket not connected');
        // socket.connect();
        console.log(socket.disconnected);
    }
    socket.emit('send_message', {
        senderId: chat?.senderId,
        recipientId: chat?.recipientId,
        message,
        instructions
      });
  };