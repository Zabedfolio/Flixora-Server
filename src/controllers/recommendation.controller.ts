import { Request, Response } from "express";

import { createRecommendation } from "../services/recommendation.service";

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /*
     * Get user activity
     *
     * Replace this with your
     * actual User model query.
     */

    const user = await User.findById(userId).select(
      "watchHistory exploredMovies savedMovies likedMovies",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const activity = {
      history: user.watchHistory || [],

      explored: user.exploredMovies || [],

      saved: user.savedMovies || [],

      liked: user.likedMovies || [],
    };

    /*
     * Need minimum activity
     */

    const totalActivity =
      activity.history.length +
      activity.explored.length +
      activity.saved.length +
      activity.liked.length;

    if (totalActivity === 0) {
      return res.status(200).json({
        success: true,

        data: {
          movies: [],
          message:
            "Watch or explore some movies to get personalized recommendations.",
        },
      });
    }

    /*
     * Generate / get cached
     * recommendations
     */

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
