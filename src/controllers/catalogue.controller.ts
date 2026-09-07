import { Request, Response } from "express";
import mongoose from "mongoose";

const getCollectionCount = async (
  collectionName: string,
  filter?: Record<string, unknown>,
) => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database connection is not ready");
  }

  return db.collection(collectionName).countDocuments(filter || {});
};

export const getCatalogueStats = async (_req: Request, res: Response) => {
  try {
    const [totalMovies, totalTvShows, publishedMovies, publishedTvShows, hiddenMovies, hiddenTvShows] =
      await Promise.all([
        getCollectionCount("movies"),
        getCollectionCount("tvShows"),
        getCollectionCount("movies", { $or: [{ published: true }, { status: "published" }] }),
        getCollectionCount("tvShows", { $or: [{ published: true }, { status: "published" }] }),
        getCollectionCount("movies", { $or: [{ published: false }, { status: { $in: ["draft", "hidden"] } }] }),
        getCollectionCount("tvShows", { $or: [{ published: false }, { status: { $in: ["draft", "hidden"] } }] }),
      ]);

    return res.status(200).json({
      success: true,
      message: "Catalogue stats fetched successfully",
      data: {
        totalMovies,
        totalTvShows,
        published: publishedMovies + publishedTvShows,
        hidden: hiddenMovies + hiddenTvShows,
      },
    });
  } catch (error) {
    console.error("Catalogue stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch catalogue stats",
    });
  }
};