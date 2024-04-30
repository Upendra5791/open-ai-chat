const { socketCheck } = require("./socketCheck");
const { registerChat } = require("./registerChat");
const { sendMessage } = require("./message/sendMessage");
const { sendMessageAI } = require("./message/sendMessageAI");
const { searchUser } = require("./user/searchUser");
const { greetUser } = require("./user/greetUser");
const { initialiseTool } = require("./tool/initialiseTool");
const { sendToolMessage } = require("./tool/sendToolMessage");

const assistantUser = {
  id: "open-ai-v1",
  socketId: "open-ai-v1",
  name: "Assistant",
};

const clientPing = ({ io, socket }) => {
  return async (user, callback) => {
    if (!socket.disconnected)
      callback({ message: "Connection Alive!", status: 0 });
  };
};

const initEventHandlers = ({ io, db, openai }) => {
  io.on("connection", async (socket) => {
    const { userId, assistantId, threadId } = socket.handshake.auth;
    socket.userId = userId;
    if (assistantId) socket.assistantId = assistantId;
    if (threadId)  socket.threadId = threadId;
    console.log(assistantId);
    console.log(threadId);
    console.log("new connection " + socket.id + " " + userId);

    updateUserData({ io, socket, db, userId });
    replayPendingMessages({ io, socket, db, userId });

    socket.on("socket_check", socketCheck({ io, socket, db, openai }));
    socket.on("chat_register", registerChat({ io, socket, db, openai }));
    socket.on("client_ping", clientPing({ io, socket }));
    socket.on("send_message", sendMessage({ io, socket, db, openai }));
    socket.on("send_message_ai", sendMessageAI({ io, socket, db, openai }));
    socket.on("search", searchUser({ io, socket, db, openai }));
    socket.on("greet_user", greetUser({ io, socket, db, openai }));
    socket.on("initialise_tool", initialiseTool({ io, socket, db, openai }));
    socket.on("send_tool_message", sendToolMessage({ io, socket, db, openai }));
    socket.onAny((eventName, ...args) => {
      console.log(eventName, socket.id);
    });

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

const replayPendingMessages = ({ io, socket, db, userId }) => {
  db.getMessages(userId).then(
    (messages) => {
      !!messages &&
        Object.values(messages)?.forEach((message) => {
          const sender =
            message.senderId === "open-ai-v1"
              ? assistantUser
              : db.getUserMap()[message.senderId];
          io.to(socket.id)
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
                  await db.removeMessage(userId, message);
                }
              }
            );
        });
    },
    (err) => {
      console.log(err);
    }
  );
};

const updateUserData = ({ io, socket, db, userId }) => {
  if (
    db.getUserMap()[userId] &&
    db.getUserMap()[userId].socketId !== socket.id
  ) {
    const user = {
      ...db.getUserMap()[userId],
      socketId: socket.id,
    };
    if (socket.assistantId) user.assistantId = socket.assistantId;
    if (socket.threadId)  user.threadId = socket.threadId;
    db.writeUserData(user);
  }
};

module.exports = { initEventHandlers };
