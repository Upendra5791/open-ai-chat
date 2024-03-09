const OpenAI = require("openai");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/*
content: `You are a helpful chat assistant in a Chat application. Translate the user provided message to ${language}. Correct the text before translating if any grammatical error exists. Only return the translated message after translation. If unable to translate then return message - Unable to Translate. Sample input: Where do you live? Expected Output: तपाईं कहाँ बस्नुहुन्छ?`,
 */

const prompts = {
  chatAssistant: "You are a helpful chat assistant. Be polite.",
};

let openai;
const MAX_TOKEN_LIMIT = 500;

const connect = () => {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
  console.log("Connected to OpenAI");
};

const translateMessage = async ({ message, language }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          { role: "user", content: message.text },
          {
            role: "system",
            content: `You are a helpful chat assistant in a Chat application. Translate the user provided message to ${language}. Sample input: Where do you live? Expected Output: तपाईं कहाँ बस्नुहुन्छ?`,
          },
        ],
        max_tokens: MAX_TOKEN_LIMIT,
        model: "gpt-3.5-turbo",
        temperature: 0,
      });
      resolve(chatCompletion.choices[0].message.content || "");
    } catch (e) {
      if (e.status === 401) {
        console.log("invalid_api_key");
      }
      reject("Error Sending Message");
    }
  });
};

const postMessageToAI = ({socket, message}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create a message
      await openai.beta.threads.messages.create(socket.threadId, {
        role: "user",
        content: message.text,
      });
      // run the assistant to process the message
      const newRun = await openai.beta.threads.runs.create(
        socket.threadId, {
          assistant_id: socket.assistantId
        }
      );
      // poll the run job to check if the run is complete
      const runInterval = setInterval(async () => {
        const run = await openai.beta.threads.runs.retrieve(
          socket.threadId,
          newRun.id
        );
        if (run.status === 'completed') {
          clearInterval(runInterval);
          const messages = await openai.beta.threads.messages.list(
            socket.threadId
          );
          resolve(messages.data[0].content[0].text.value);
        } else if (!['queued', 'in_progress'].includes(run.status)) {
          clearInterval(runInterval);
        }
      }, 500);
    } catch (e) {
      reject("Error Sending Message");
    }
  });
}

const createAssistant = async (socket) => {
  return new Promise(async (resolve) => {
    assistant = await openai.beta.assistants.create({
      name: "Personal Assistant",
      instructions: "You are a personal assistant.Be polite with the user.",
      tools: [],
      model: "gpt-3.5-turbo",
    });
    socket.assistantId = assistant.id;
    resolve(assistant);
  });
};

const createThread = async (socket) => {
  return new Promise(async resolve => {
    const thread = await openai.beta.threads.create();
    socket.threadId = thread.id;
    resolve(thread);
  })
};

module.exports = {
  translateMessage,
  connect,
  postMessageToAI,
  createAssistant,
  createThread
};
