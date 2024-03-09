const { socketCheck } = require("./socketCheck");
const { registerChat } = require("./registerChat");
const { sendMessage } = require("./message/sendMessage");
const { sendMessageAI } = require("./message/sendMessageAI");
const { searchUser } = require("./user/searchUser");
const { greetUser } = require("./user/greetUser");

const initEventHandlers = ({ io, db, openai }) => {
  io.on("connection", async (socket) => {
    const {userId, assistant } = socket.handshake.auth;
    socket.userId = userId;
    socket.assistantId = assistant?.assistantId;
    socket.threadId = assistant?.threadId;
    console.log("new connection " + socket.id);
    if (
      db.getUserMap()[userId] &&
      db.getUserMap()[userId].socketId !== socket.id
    ) {
      db.writeUserData({
        ...db.getUserMap()[userId],
        socketId: socket.id,
      });
    }

    socket.on("socket_check", socketCheck({ io, socket, db, openai }));
    socket.on("chat_register", registerChat({ io, socket, db, openai }));
    socket.on("send_message", sendMessage({ io, socket, db, openai }));
    socket.on("send_message_ai", sendMessageAI({ io, socket, db, openai }));
    socket.on("search", searchUser({ io, socket, db, openai }));
    socket.on("greet_user", greetUser({ io, socket, db, openai }));

    // Disconnect event
    socket.on("disconnect", (r) => {
      console.log("User disconnected: " + socket.id + " " + r);

      // Remove user from mapping
      //   const id = Object.keys(userSocketMap).find(
      //     (key) => userSocketMap[key] === socket.id
      //   );
      //   if (id) {
      //     delete userSocketMap[id];
      //   }
    });
  });
};

module.exports = { initEventHandlers };
