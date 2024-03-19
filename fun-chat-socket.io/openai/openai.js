const OpenAI = require("openai");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
/*
content: `You are a helpful chat assistant in a Chat application. Translate the user provided message to ${language}. Correct the text before translating if any grammatical error exists. Only return the translated message after translation. If unable to translate then return message - Unable to Translate. Sample input: Where do you live? Expected Output: तपाईं कहाँ बस्नुहुन्छ?`,
 -- If the user provided message is already in ${language} just return the message without translating. */
//Ask the user for the language and then reply to the user in the user provided language.
const promptsMap = {
  INITIAL_ASSISTANT_INSTRUCTION:
    "You are a personal assistant. Be polite with the user. ",
  LANGUAGE_CHANGE_INSTRUCTION: `Ask the user for the language to converse in.`,
  ASSIGN_NAME_INSTRUCTION:
    "The user wants to assign you a name. Ask the user for the name that they want to assign you.",
  INITIALISE_ITENIRARY_PLANNER: `
  You are an interactive chat assistant that helps in planning visits to cities.
Ask the user the following, one question at a time before creating the actual itinerary:
  1) Where would you like to travel 
  2) Travel Date
  3) Number of days
  4) Maximum budget
  5) Preferences like 'Offbeat location', 'city scape', 'museums', 'famous attractions', etc

  Next, based on the answer provided by the user for the above questions, create a itinerary that best fits the answers for the above question.

  Based on the number of days provided by the user, suggest some hotels that would fit the user's budget.
  Also suggest some good restaurant, cafes, eateries etc that the user can try in that city

  BE CRISP AND CLEAR. ASK THE ABOVE QUESTIONS ONE AT A TIME. DO NOT ASK ALL THE QUESTIONS AT A GO.
Start by asking the first question - Where would you like to travel?
  `,
};

let openai;
const MAX_TOKEN_LIMIT = 500;

const connect = () => {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
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
            content: `You are an expert language translator assistant in a Chat application.
             Translate the user provided message to ${language}.
             `,
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

const generateChatResponse = async ({ messages }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [...messages],
        max_tokens: MAX_TOKEN_LIMIT,
        model: "gpt-3.5-turbo",
        temperature: 1,
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

const getInstruction = (instruction) => {
  return promptsMap[instruction];
};

const postMessageToAssistant = ({
  assistantId,
  threadId,
  message,
  instructions,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create a message
      if (
        ![
          "LANGUAGE_CHANGE_INSTRUCTION",
          "ASSIGN_NAME_INSTRUCTION",
          "INITIALISE_ITENIRARY_PLANNER",
        ].includes(instructions)
      ) {
        await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: message.text,
        });
      }

      // run the assistant to process the message
      const newRun = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        instructions: instructions
          ? getInstruction(instructions)
          : promptsMap.INITIAL_ASSISTANT_INSTRUCTION,
      });
      // poll the run job to check if the run is complete
      const runInterval = setInterval(async () => {
        const run = await openai.beta.threads.runs.retrieve(
          threadId,
          newRun.id
        );
        if (run.status === "completed") {
          clearInterval(runInterval);
          const messages = await openai.beta.threads.messages.list(threadId);
          resolve(messages.data[0].content[0].text.value);
        } else if (!["queued", "in_progress"].includes(run.status)) {
          clearInterval(runInterval);
        }
      }, 500);
    } catch (e) {
      console.log(e);
      reject("Error Sending Message");
    }
  });
};

const createAssistant = async (socket) => {
  return new Promise(async (resolve) => {
    assistant = await openai.beta.assistants.create({
      name: "Personal Assistant",
      instructions: promptsMap.INITIAL_ASSISTANT_INSTRUCTION,
      tools: [],
      model: "gpt-3.5-turbo",
    });
    socket.assistantId = assistant.id;
    resolve(assistant);
  });
};

const createThread = async (socket) => {
  return new Promise(async (resolve) => {
    const thread = await openai.beta.threads.create();
    socket.threadId = thread.id;
    resolve(thread);
  });
};

const deleteThread = async (socket) => {
  return new Promise(async (resolve) => {
    const status = await openai.beta.threads.del(socket.threadId);
    socket.threadId = null;
    resolve(status);
  });
};

module.exports = {
  openai,
  translateMessage,
  connect,
  postMessageToAssistant,
  createAssistant,
  createThread,
  deleteThread,
  getInstruction,
  generateChatResponse,
};
