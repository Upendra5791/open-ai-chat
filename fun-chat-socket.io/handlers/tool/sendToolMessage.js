const { uid } = require("uid/secure");

const sendToolMessage = ({ io, socket, db, openai }) => {
  return async ({ senderId, recipientId, message, instructions, tool }) => {
    if (instructions === "CLEAR_THREAD_INSTRUCTION") {
      resetThread({ io, socket, db, openai, senderId });
    } else {
      const threadMessages = await db.getThreadMessages(tool.threadId);
      const updatedMessages = [
        ...threadMessages,
        {
          role: "user",
          content: message.text,
        },
      ];
      db.addMessageToThread({
        threadId: tool.threadId,
        messages: updatedMessages,
      });
      const generatedMessage = await openai.generateChatResponse({
        messages: updatedMessages,
      });
      const newThreadMessages = await db.getThreadMessages(tool.threadId);
      const toolMessage = [
        ...newThreadMessages,
        {
          role: "assistant",
          content: generatedMessage,
        },
      ];
      db.addMessageToThread({ threadId: tool.threadId, messages: toolMessage });

      postMessagetoUser({ io, db, generatedMessage, tool, senderId });
    }
  };
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

const postMessagetoUser = ({ io, db, generatedMessage, tool, senderId }) => {
  const toolMessage = {
    id: uid(16),
    text: generatedMessage,
    time: new Date().toString(),
    senderId: tool.id,
    recipientId: senderId,
  };
  db.addMessage(senderId, {
    ...toolMessage,
    status: "PENDING",
  });
  const senderSocketId = db.getUserMap()[senderId]?.socketId;
  io.to(senderSocketId)
    .timeout(5000)
    .emit(
      "receive_message",
      {
        sender: tool,
        message: toolMessage,
      },
      async (err, res) => {
        if (res?.[0]?.messageId === toolMessage.id) {
          console.log("Removing message " + toolMessage.id);
          await db.removeMessage(toolMessage.recipientId, toolMessage);
        }
      }
    );
};

module.exports = { sendToolMessage };
