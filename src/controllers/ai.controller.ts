import { Request, Response } from "express";
import { generateMovieFilters } from "../services/ai.services";
import { searchMoviesForAI } from "../services/tmdb.services";
import { getAIRecommendationsFromGenres } from "../services/recommendation.service";
import { MovieActivity } from "../models/movieActivity.model";


export const movieAssistant = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { prompt } = req.body;

    /* ==============================
       Validate Prompt
    ============================== */

    if (!prompt || !prompt.trim()) {
      res.status(400).json({
        success: false,
        message: "Movie prompt is required.",
      });

      return;
    }

    /* ==============================
       1. Gemini
    ============================== */

    const filters = await generateMovieFilters(prompt);


    console.log(
      "AI Filters:",
      filters
    );

    /* ==============================
       2. TMDB
    ============================== */

    const movies =await searchMoviesForAI(filters);

    /* ==============================
       3. Response
    ============================== */

    res.status(200).json({

      success: true,

      data: {
        message:
          "Here are some movies based on your request.",

        movies,
      },

    });

  } catch (error: any) {

    console.error(
      "AI Controller Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to generate movie recommendations.",

    });
  }
};

export const getGenreRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.body?.userId || req.query?.userId || (req as any).user?.id;

    let userGenres: string[] = [];

    if (userId) {
      const activity = await MovieActivity.findOne({ userId }).select("genres").lean();
      if (activity && Array.isArray(activity.genres)) {
        userGenres = activity.genres;
      }
    }

    // Fallback to body genres if provided when userId activity has no genres
    if (userGenres.length === 0 && Array.isArray(req.body?.genres)) {
      userGenres = req.body.genres;
    }

    const recommendationData = await getAIRecommendationsFromGenres(userGenres);

    res.status(200).json({
      success: true,
      data: recommendationData,
    });
  } catch (error: any) {
    console.error("Genre Recommendations Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations based on watch history genres.",
    });
  }
};
