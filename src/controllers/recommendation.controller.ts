import { Request, Response } from "express";
import { createRecommendation } from "../services/recommendation.service";

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req.query.userId as string);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activity = {
      history: req.body?.watchHistory || [],
      explored: req.body?.exploredMovies || [],
      saved: req.body?.savedMovies || [],
      liked: req.body?.likedMovies || [],
    };

    const recommendation = await createRecommendation(userId, activity);

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Recommendation Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations.",
    });
  }
};
