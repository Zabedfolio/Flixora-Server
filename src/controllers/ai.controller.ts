import { Request, Response } from "express";
import axios from "axios";
import Config from "../config/config";
import { ChatHistory, IChatMessage } from "../models/chatHistory.model";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Helper to fetch TMDB API
const fetchTMDB = async (endpoint: string, params: Record<string, any> = {}) => {
  try {
    const res = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: Config.TMDB_API_KEY,
        language: "en-US",
        include_adult: false,
        ...params,
      },
    });
    return res.data;
  } catch (err) {
    return null;
  }
};

const getPosterUrl = (path?: string) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : "https://via.placeholder.com/500x750?text=No+Poster";
};

// Helper to extract TMDB movies
const extractTMDBMovies = (results: any[], count: number = 6) => {
  return (results || [])
    .filter((m: any) => m.media_type !== "person")
    .slice(0, count)
    .map((m: any) => {
      const itemTitle = m.title || m.name || "Featured Title";
      const itemDate = m.release_date || m.first_air_date;
      return {
        id: m.id.toString(),
        title: itemTitle,
        original_title: m.original_title || m.original_name,
        year: itemDate ? new Date(itemDate).getFullYear() : 2026,
        rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
        genres: m.genre_ids || ["Featured"],
        posterUrl: getPosterUrl(m.poster_path),
        poster_path: m.poster_path ? getPosterUrl(m.poster_path) : null,
        backdrop_path: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
        overview: m.overview || "",
        vote_average: m.vote_average,
        vote_count: m.vote_count,
        release_date: m.release_date || m.first_air_date,
        media_type: m.media_type || "movie",
      };
    });
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, userId } = req.query;
    if (!sessionId && !userId) {
      res.status(400).json({ success: false, message: "sessionId or userId is required." });
      return;
    }

    const filter = userId ? { userId: String(userId) } : { sessionId: String(sessionId) };
    const history = await ChatHistory.findOne(filter);

    res.status(200).json({
      success: true,
      messages: history?.messages || [],
    });
  } catch (err) {
    console.error("Get Chat History Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch chat history." });
  }
};

export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, userId } = req.body || req.query;
    if (!sessionId && !userId) {
      res.status(400).json({ success: false, message: "sessionId or userId is required." });
      return;
    }

    const filter = userId ? { userId: String(userId) } : { sessionId: String(sessionId) };
    await ChatHistory.deleteOne(filter);

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully.",
    });
  } catch (err) {
    console.error("Clear Chat History Error:", err);
    res.status(500).json({ success: false, message: "Failed to clear chat history." });
  }
};
