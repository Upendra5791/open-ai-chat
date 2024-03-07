const assistantUser = {
  id: "open-ai-v1",
  socketId: "open-ai-v1",
  name: "Assistant",
};

const greetUser = ({ io, socket, db, openai }) => {
  return ({ user }) => {
    try {
      console.log(user);
      const senderSocketId = db.getUserMap()[user.id]?.socketId;
      const initMessage = {
        text: `Hi, I am ${user.name}`,
      };
      openai.postMessageToAI(initMessage).then(
        (res) => {
          const assistantMessage = {
            text: res,
            time: new Date().toString(),
            senderId: "open-ai-v1",
            recipientId: user.id,
          };
          io.to(senderSocketId).emit("receive_message", {
            sender: assistantUser,
            message: assistantMessage,
          });
        },
        (err) => {
          console.log(err);
        }
      );
    } catch (e) {
      console.log("Error Greeting the user!");
    }
  };
};

module.exports = { greetUser };
