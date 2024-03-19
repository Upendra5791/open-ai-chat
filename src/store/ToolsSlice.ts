import { createSlice } from "@reduxjs/toolkit";
import { User } from "./UserSlice";
import { AppDispatch } from "./store";
import {
  addToolToIndexedDB,
  getToolsFromIndexedDB,
  updateToolToIndexedDB,
} from "../utils/indexedDB";
import { socket } from "../utils/socket";

export const DEFAULT_ITENIRARY_PLANNER_ID = "tool-itinerary-planner-v1";
const TOOLS = [
  {
    id: DEFAULT_ITENIRARY_PLANNER_ID,
    recipientId: DEFAULT_ITENIRARY_PLANNER_ID,
    recipientName: "Itenirary Planner",
    initialiseInstruction: "INITIALISE_ITENIRARY_PLANNER",
  },
];

export type RecieveMessageResponse = {
  sender: User;
  message: Message;
};

export type Message = {
  id: string;
  text: string;
  time: string;
  senderId: string | undefined;
  recipientId: string | undefined;
  status?: "PENDING" | "DELIVERED";
};

export type Tool = {
  id: string;
  senderId: string;
  recipientId: string;
  recipientName: string;
  socketId: string;
  messages: Message[];
  isCurrentTool?: boolean;
  unreadMessageCount?: number;
  threadId?: string;
};

export type ToolsSlice = {
  tools: Tool[];
};

const initialState: ToolsSlice = {
  tools: [],
};

export const toolsSlice = createSlice({
  name: "tools",
  initialState: initialState,
  reducers: {
    addTool: (state, { payload }: { payload: Tool }) => {
      state.tools = [...state.tools, payload];
    },
    updateTool: (state, { payload }: { payload: Tool }) => {
      state.tools = state.tools.map((t) => {
        if (t.id === payload.id) {
          return {
            ...t,
            ...payload,
          };
        } else return t;
      });
    },
    setCurrentTool: (state, { payload }: { payload: string }) => {
      state.tools = state.tools.map((c) => {
        if (c.recipientId === payload) {
          return {
            ...c,
            isCurrentTool: true,
          };
        } else {
          return {
            ...c,
            isCurrentTool: false,
          };
        }
      });
    },
    addNewToolMessage: (
      state,
      { payload }: { payload: { message: Message; tool: Tool } }
    ) => {
      state.tools = state.tools.map((tool: Tool) => {
        if (tool.recipientId === payload.tool.recipientId) {
          return {
            ...tool,
            messages: [...tool.messages, payload.message],
            unreadMessageCount:
              tool.unreadMessageCount === undefined
                ? 1
                : ++tool.unreadMessageCount,
          };
        } else {
          return tool;
        }
      });
    },
    updateMessageReadStatus: (
      state,
      { payload }: { payload: { tool: Tool } }
    ) => {
      state.tools = state.tools.map((tool: Tool) => {
        if (tool.recipientId === payload.tool.recipientId) {
          return {
            ...tool,
            unreadMessageCount: 0,
          };
        } else {
          return tool;
        }
      });
    },
    clearTool: (state, { payload }: { payload: { tool: Tool } }) => {
      state.tools = state.tools.map((c: Tool) => {
        if (c.id === payload.tool.id) {
          return {
            ...c,
            messages: [],
          };
        } else return c;
      });
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addTool,
  updateTool,
  addNewToolMessage,
  setCurrentTool,
  updateMessageReadStatus,
  clearTool,
} = toolsSlice.actions;

export default toolsSlice.reducer;

export const fetchTools = () => async (dispatch: AppDispatch) => {
  const toolsInDB = await getToolsFromIndexedDB();
  toolsInDB?.forEach((tool: Tool) => {
    dispatch(addTool(tool));
  });
  return toolsInDB;
};

export const initialiseTools =
  (user: User) => async (dispatch: AppDispatch) => {
    TOOLS.forEach((tool) => {
      dispatch(
        addTool({
          id: tool.id,
          recipientId: tool.recipientId,
          recipientName: tool.recipientName,
          senderId: user.id,
          socketId: user.socketId,
          messages: [],
        })
      );
    });
    //add this to indexedDB as well
  };

export const initialiseTool =
  (tool: Tool, user: User) => async (dispatch: AppDispatch) => {
    socket.emit(
      "initialise_tool",
      {
        user,
        tool,
        instructions: TOOLS.find((f) => f.id === tool.id)
          ?.initialiseInstruction,
      },
      (res: any) => {
        dispatch(
          updateTool({
            ...tool,
            threadId: res.threadId,
          })
        );
        updateToolToIndexedDB({
          ...tool,
          threadId: res.threadId,
        }).then(() => console.log("Tool updated in DB"));
      }
    );
    addToolToIndexedDB(tool).then(() => console.log("Tool added in DB"));
  };

export const sendMessage =
  (tool: Tool, message: Message, instructions?: string) =>
  (dispatch: AppDispatch) => {
    if (instructions === "CLEAR_THREAD_INSTRUCTION") {
      dispatch(clearTool({ tool }));
    } else {
      dispatch(
        addNewToolMessage({
          message,
          tool,
        })
      );
      socket.emit("send_tool_message", {
        senderId: tool?.senderId,
        recipientId: tool?.recipientId,
        message,
        instructions: TOOLS.find((f) => f.id === tool.id)
          ?.initialiseInstruction,
        tool,
      });
      // update the message to the DB
      if (instructions === "CLEAR_THREAD_INSTRUCTION") {
        updateToolToIndexedDB({
          ...tool,
          messages: [],
        }).then(() => console.log("Tool Message cleared in DB"));
      } else {
        updateToolToIndexedDB({
          ...tool,
          messages: [...tool.messages, message],
        }).then(() => console.log("Tool Message updated in DB"));
      }
    }
  };
