import { Request, Response } from "express";
import { generateMovieFilters } from "../services/heroGemini.services";
import { searchMoviesForAI } from "../services/heroTmdb.services";

export const movieAssistant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { prompt } = req.body;
    console.log(prompt);

    if (!prompt || !prompt.trim()) {
      res.status(400).json({
        success: false,
        message: "Movie prompt is required.",
      });
      return;
    }

    /* ==============================
       1. Gemini (User Input → Filters)
    ============================== */
    const filters = await generateMovieFilters(prompt);
    console.log("Gemini Extracted Filters:", filters);

    /* ==============================
       2. TMDB (Discover + Random Page/Sort + Shuffle)
    ============================== */
    const movies = await searchMoviesForAI(filters);
    console.log("TMDB Movies:", movies);

    /* ==============================
       3. Response (Return 6 Movies)
    ============================== */
    res.status(200).json({
      success: true,
      data: {
        message: `Found movies for mood: ${filters.mood || "custom"}`,
        filters,
        movies,
      },
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate movie recommendations.",
    });
  }
};
