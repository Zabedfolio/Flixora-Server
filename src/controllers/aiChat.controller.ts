import { Request, Response } from "express";
import { askFlixoraChatbot } from "../services/aiChatGemini.service.js";

export async function handleAIChatRequest(req: Request, res: Response) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty user message is required.",
      });
    }

    const formattedHistory = Array.isArray(history) ? history : [];

    // Call Gemini Engine + TMDB Tool Execution
    const result = await askFlixoraChatbot(message.trim(), formattedHistory);
    
    return res.status(200).json({
      success: true,
      data: {
        message: result.text,
        movies: result.mediaResults || [],
      },
    });
  } catch (error: any) {
    console.error("AI Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message:
        "An internal server error occurred while processing your chat request.",
    });
  }
}
