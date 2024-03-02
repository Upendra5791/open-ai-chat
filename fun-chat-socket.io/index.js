const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
const openai = require("./openai");

// Store mapping of user IDs to socket IDs
const userSocketMap = {};
const usersListDB = [];
const assistantUser = {
  id: "open-ai-v1",
  socketId: "open-ai-v1",
  name: "Assistant",
};

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // socket check
  socket.on("socket_check", (user, callback) => {
    try {
      // check if userId already mapped with existing socket
      usersListDB.push(user);
      userSocketMap[user.id] = socket.id;
      console.log(
        "User " + user.id + " registered with socket ID " + socket.id
      );
      callback({
        status: 0,
        message: "User successfully registered!",
        socketId: socket.id,
      });
    } catch (e) {
      callback({
        status: 1,
        message: "Error while registering user - " + e,
        socketId: socket.id,
      });
    }
  });

  // Handling chat register
  socket.on("chat_register", (user, callback) => {
    try {
      // Store the mapping of user ID to socket ID
      if (!usersListDB.find((f) => f.id === user.id)) {
        usersListDB.push(user);
        console.log(
          "User " + user.id + " registered with socket ID " + socket.id
        );
      } else {
        console.log("Existing User " + user.id + " registered with socket ID " + socket.id);
      }
      userSocketMap[user.id] = socket.id;

      callback({
        status: 0,
        message: "User successfully registered!",
        socketId: socket.id,
      });
    } catch (e) {
      callback({
        status: 1,
        message: "Error while registering user - " + e,
        socketId: socket.id,
      });
    }
  });

  // Handling messages
  socket.on("send_message", (data) => {
    const { senderId, recipientId, message } = data;
    // console.log(message);
    const senderSocketId = userSocketMap[senderId];
    if (recipientId === "open-ai-v1") {
      openai
        .postMessageToAI(message)
        .then((res) => {
          const assistantMessage = {
            text: res,
            time: new Date().toString(),
            senderId: "open-ai-v1",
            recipientId: senderId,
        }
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
      const recipientSocketId = userSocketMap[recipientId];
      if (recipientSocketId) {
        console.log(message);
        const sender = usersListDB.find((f) => f.id === senderId);
        io.to(recipientSocketId).emit("receive_message", { sender, message });
      } else {
        console.log("Recipient is not online");
      }
    }
  });

  // Handling Assistant message
  socket.on("send_message_ai", (data, callback) => {
    const { message, language } = data;
    console.log(message);
    // Forward message to recipient
    openai
      .translateMessage({
        message,
        language,
      })
      .then((res) => {
        callback(res);
      });
  });

  // Handling Search user
  socket.on("search", (data, callback) => {
    const filteredList = usersListDB.filter((f) =>
      f.name.toLowerCase().includes(data.toLowerCase())
    );
    callback({
      results: filteredList,
    });
  });

  
  socket.on("greet_user", ( {user}) => {
    try {
      console.log(user);
      const senderSocketId =  userSocketMap[user.id];
      const initMessage = {
        text: `Hi, I am ${user.name}`
      };
      openai
      .postMessageToAI(initMessage)
      .then((res) => {
        const assistantMessage = {
          text: res,
          time: new Date().toString(),
          senderId: "open-ai-v1",
          recipientId: user.id,
      }
        io.to(senderSocketId).emit("receive_message", {
          sender: assistantUser,
          message: assistantMessage,
        });
      })
    } catch(e) {
      console.log('Error Greeting the user!');
    }
   
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);

    // Remove user from mapping
    const id = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (id) {
      delete userSocketMap[id];
    }
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
  openai.connectOpenAI().then((res) => {
    console.log("Connected to OpenAI");
    // console.log(res);
  });
});
