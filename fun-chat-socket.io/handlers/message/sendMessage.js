const { uid } = require("uid/secure");
const assistantUser = {
  id: "open-ai-v1",
  socketId: "open-ai-v1",
  name: "Assistant",
};

const sendMessage = ({ io, socket, db, openai }) => {
  return async ({ senderId, recipientId, message, instructions }) => {
    if (recipientId === "open-ai-v1") {
      handleAssistantMessage({
        io,
        socket,
        db,
        openai,
        senderId,
        message,
        instructions,
      });
    } else {
      // Forward message to recipient
      const recipientSocketId = db.getUserMap()[recipientId]?.socketId;
      if (recipientSocketId) {
        console.log(`${message.text} from ${senderId} to ${recipientId}`);
        const sender = db.getUserMap()[senderId];
        io.to(recipientSocketId)
          .timeout(5000)
          .emit(
            "receive_message",
            {
              sender,
              message,
            },
            async (err, res) => {
              if (res?.[0]?.messageId === message.id) {
                console.log('Removing message ' + message.id );
                await db.removeMessage(recipientId, message);
              }
            }
          );
      } else {
        console.log("Recipient is not online");
      }
      // add message to DB
      db.addMessage(recipientId, {
        ...message,
        status: "PENDING",
      });
    }
  };
};

const handleAssistantMessage = async ({
  io,
  socket,
  db,
  openai,
  senderId,
  message,
  instructions,
}) => {
  const senderSocketId = db.getUserMap()[senderId]?.socketId;
  if (instructions === "CLEAR_THREAD_INSTRUCTION") {
    resetThread({ io, socket, db, openai, senderId });
  } else {
    openai
      .postMessageToAI({
        socket,
        message,
        instructions,
      })
      .then((res) => {
        const assistantMessage = {
          id: uid(16),
          text: res,
          time: new Date().toString(),
          senderId: "open-ai-v1",
          recipientId: senderId,
        };
        // add message to DB
        db.addMessage(senderId, {
          ...assistantMessage,
          status: "PENDING",
        });
        io.to(senderSocketId)
          .timeout(5000)
          .emit(
            "receive_message",
            {
              sender: assistantUser,
              message: assistantMessage,
            },
            async (err, res) => {
              if (res?.[0]?.messageId === assistantMessage.id) {
                console.log('Removing message ' + assistantMessage.id );
                await db.removeMessage(senderId, assistantMessage);
              }
            }
          );
      })
      .catch((e) => {
        io.to(senderSocketId).emit("receive_message", {
          sender: assistantUser,
          message: "Error generating Assistant Message",
        });
      });
  }
};

const resetThread = async ({ io, socket, db, openai, senderId }) => {
  await openai.deleteThread(socket);
  const newThread = await openai.createThread(socket);
  const senderSocketId = db.getUserMap()[senderId]?.socketId;
  io.to(senderSocketId).emit("assistant_update", {
    assistantId: socket.assistantId,
    threadId: newThread.id,
  });
};

module.exports = { sendMessage };
