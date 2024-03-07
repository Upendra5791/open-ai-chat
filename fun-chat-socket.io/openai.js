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

const postMessageToAI = (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          { role: "user", content: message.text },
          {
            role: "system",
            content: prompts.chatAssistant,
          },
        ],
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

module.exports = { translateMessage, connect, postMessageToAI };
