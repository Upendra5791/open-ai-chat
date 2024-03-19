const { uid } = require("uid/secure");
const { getInstruction } = require("../../openai/openai");

const createThread = ({ db, message }) => {
  return new Promise((resolve) => {
    db.createThread({
      messages: [message],
    }).then((thread) => {
      resolve(thread);
    });
  });
};

const initialiseTool = ({ io, socket, db, openai }) => {
  return async ({ user, tool, instructions }, callback) => {
    console.log("initialise tool ", user.id);
    try {
      const message = {
        role: "system",
        content: getInstruction(instructions),
      };
      const threadId = await createThread({ db, message });
      const thread = await db.getThreadMessages(threadId);
      callback({
        threadId,
      });
      const generatedMessage = await openai.generateChatResponse({
        messages: thread.messages,
      });
      const toolMessage = [
        {
          role: "system",
          content: getInstruction(instructions),
        },
        {
          role: "assistant",
          content: generatedMessage,
        },
      ];
      db.addMessageToThread({ threadId: threadId, messages: toolMessage }).then(
        (threadId) => {
          console.log(threadId);
        }
      );

      postMessagetoUser({ io, db, user, generatedMessage, tool });
    } catch (e) {
      console.log("Error initialising tool", e);
    }
  };
};

const postMessagetoUser = ({ io, db, user, generatedMessage, tool }) => {
  const assistantMessage = {
    id: uid(16),
    text: generatedMessage,
    time: new Date().toString(),
    senderId: tool.id,
    recipientId: user.id,
  };
  db.addMessage(user.id, {
    ...assistantMessage,
    status: "PENDING",
  });
  const senderSocketId = db.getUserMap()[user.id]?.socketId;
  io.to(senderSocketId)
    .timeout(5000)
    .emit(
      "receive_message",
      {
        sender: tool,
        message: assistantMessage,
      },
      async (err, res) => {
        if (res?.[0]?.messageId === assistantMessage.id) {
          console.log("Removing message " + assistantMessage.id);
          await db.removeMessage(
            assistantMessage.recipientId,
            assistantMessage
          );
        }
      }
    );
};

module.exports = { initialiseTool };
