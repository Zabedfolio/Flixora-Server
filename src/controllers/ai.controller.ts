import { Request, Response } from "express";
import { generateMovieFilters } from "../services/ai.services";
import { searchMoviesForAI } from "../services/tmdb.services";


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