import { Request, Response } from "express";
import { MovieActivity } from "../models/movieActivity.model";

export const addWatchedMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId, genres } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID is required",
      });
    }

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Genres must be a non-empty array",
      });
    }

    const activity = await MovieActivity.findOneAndUpdate(
      { userId: userId },
      {
        $addToSet: {
          genres: { $each: genres },
        },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Movie genres added to watch history successfully",
      data: activity,
    });
  } catch (error: any) {
    console.error("Add Watched Movie Error:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to save watch history: ${error.message}`,
    });
  }
};

export const getUserGenres = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.body;

    // // 1. Validation
    // if (!userId) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: "User ID parameter is required" 
    //   });
    // }

    // 2. Fetch only the 'genres' array, skip '_id'
    const activity = await MovieActivity.findOne({ userId })
      .select("genres") 
      .lean(); // Faster execution by returning a plain JS object

    // 3. If user has no watch history yet, return an empty array
    if (!activity) {
      return res.status(200).json({
        success: true,
        genres: []
      });
    }

    // 4. Return the unique saved genres
    return res.status(200).json({
      success: true,
      genres: activity.genres
    });

  } catch (error) {
    console.error("Get User Genres Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error while fetching genres" 
    });
  }
};


