const assistantUser = {
  id: "open-ai-v1",
  socketId: "open-ai-v1",
  name: "Assistant",
};

const sendMessage = ({ io, socket, db, openai }) => {
  return async ({ senderId, recipientId, message }) => {
    const senderSocketId = db.getUserMap()[senderId]?.socketId;
    if (recipientId === "open-ai-v1") {
      openai
        .postMessageToAI(message)
        .then((res) => {
          const assistantMessage = {
            text: res,
            time: new Date().toString(),
            senderId: "open-ai-v1",
            recipientId: senderId,
          };
          io.to(senderSocketId).emit("receive_message", {
            sender: assistantUser,
            message: assistantMessage,
          });
        })
        .catch((e) => {
          io.to(senderSocketId).emit("receive_message", {
            sender: assistantUser,
            message: "Error generating Assistant Message",
          });
        });
    } else {
      // Forward message to recipient
      const recipientSocketId = db.getUserMap()[recipientId]?.socketId;
      if (recipientSocketId) {
        console.log(message);
        const sender = db.getUserMap()[senderId];
        io.to(recipientSocketId).emit("receive_message", {
          sender,
          message,
        });
      } else {
        console.log("Recipient is not online");
      }
    }
  };
};

module.exports = { sendMessage };
