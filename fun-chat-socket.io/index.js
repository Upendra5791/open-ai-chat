const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const openai = require("./openai/openai");
const db = require("./firebase");
require("dotenv").config();
const { initEventHandlers } = require("./handlers/eventHandlers");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://chat-open-ai-ab0d4.web.app",
      "https://chat-open-ai-ab0d4.firebaseapp.com",
    ],
  }
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
  db.connect();
  openai.connect();
  initEventHandlers({ io, db, openai });
});
