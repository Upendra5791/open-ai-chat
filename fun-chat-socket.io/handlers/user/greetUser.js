const { threadId } = require("worker_threads");

const assistantUser = {
  id: "open-ai-v1",
  socketId: "open-ai-v1",
  name: "Assistant",
};

const greetUser = ({ io, socket, db, openai }) => {
  return async ({ user }) => {
    try {
      let assistant;
      if (!socket.assistantId) {
        assistant = await openai.createAssistant(socket);
      } else {
        assistant = {assistantId: socket.assistantId};
      }
      const thread = await openai.createThread(socket);
      const message = {
        role: "user",
        text: `Hi, I my name is ${user.name}`,
      };
      const senderSocketId = db.getUserMap()[user.id]?.socketId;
      io.to(senderSocketId).emit("assistant_update", {
        assistantId: assistant.id,
        threadId: thread.id
      });
      db.writeUserData({
        ...db.getUserMap()[user.id],
        assistantId: assistant.id,
        threadId: thread.id
      });
      const generatedMessage = await openai.postMessageToAI({
        socket,
        message,
      });
      postMessagetoUser({ io, db, user, generatedMessage });
    } catch (e) {
      console.log("Error Greeting the user!");
    }
  };
};

const postMessagetoUser = ({ io, db, user, generatedMessage }) => {
  const assistantMessage = {
    text: generatedMessage,
    time: new Date().toString(),
    senderId: "open-ai-v1",
    recipientId: user.id,
  };
  const senderSocketId = db.getUserMap()[user.id]?.socketId;
  io.to(senderSocketId).emit("receive_message", {
    sender: assistantUser,
    message: assistantMessage,
  });
};

module.exports = { greetUser };
