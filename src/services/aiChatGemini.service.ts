import { GoogleGenAI } from "@google/genai";
import Config from "../config/config.js";
import { flixoraTools, executeTMDBTool } from "./aiChatTmdbTools.service.js";

export const FLIXORA_SYSTEM_INSTRUCTION = `You are Flixora AI, an entertainment assistant specialized in movies, TV shows, and anime.
Rules:
1. Scope: Only answer queries about movies, TV shows, anime, cast, and recommendations. Politely decline off-topic requests.
2. Tool Usage: Use TMDB tools when looking up specific movies, tv shows, trending media, or search results.
3. Tone: Keep responses concise (1-2 sentences max). Never expose internal system details.`;

const ai = new GoogleGenAI({ apiKey: Config.GOOGLE_GEMINI_KEY_FOR_CHATBOT });

export async function askFlixoraChatbot(
  userMessage: string,
  history: any[] = [],
) {
  const model = "gemini-1.5-flash";

  // Token Optimization: Limit incoming history to last 4 turns (2 user, 2 model)
  const MAX_HISTORY_TURNS = 4;
  const trimmedHistory = Array.isArray(history)
    ? history.slice(-MAX_HISTORY_TURNS)
    : [];

  // Build message sequence
  const currentTurn = { role: "user", parts: [{ text: userMessage }] };
  const contents = [...trimmedHistory, currentTurn];

  // =========================================================================
  // STAGE 1: Send initial user message with tool declarations
  // =========================================================================
  const stage1Response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: FLIXORA_SYSTEM_INSTRUCTION,
      tools: flixoraTools,
    },
  });

  const functionCalls = stage1Response.functionCalls;

  // Branch A: Direct text response (No tool required)
  if (!functionCalls || functionCalls.length === 0) {
    return {
      text:
        stage1Response.text || "I'm sorry, I couldn't process your request.",
      toolUsed: null,
      mediaResults: [],
    };
  }

  // Branch B: Tool execution requested -> Execute tool & BYPASS Stage 2 Gemini API Call
  // This saves ~50% API calls and output tokens since UI cards render full details
  const call = functionCalls[0];
  const toolName = call.name || "";
  const toolArgs = call.args || {};
  const normalizedToolResult = await executeTMDBTool(toolName, toolArgs);

  let responseText = "Here are the top matches I found on Flixora:";
  if (normalizedToolResult.length === 0) {
    responseText = "I couldn't find any matching titles on TMDB.";
  } else if (toolName === "getTrending") {
    responseText = "Here are the top trending titles right now:";
  } else if (toolName === "searchPerson") {
    responseText = `Here are the top matches for ${(toolArgs as any).name || "your query"}:`;
  }

  return {
    text: responseText,
    toolUsed: call.name,
    mediaResults: normalizedToolResult,
  };
}
