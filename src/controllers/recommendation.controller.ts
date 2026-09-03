import { Request, Response } from "express";
import { createRecommendation } from "../services/recommendation.service";
import { MovieActivity } from "../models/movieActivity.model";

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req.query.userId as string) || (req.body.userId as string);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activityData = await MovieActivity.findOne({ userId });

    const activity = {
      history: activityData?.genres || [],
      explored: [],
      saved: [],
      liked: [],
    };

    const totalActivity = activity.history.length;

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

    const recommendation = await createRecommendation(String(userId), activity);

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

