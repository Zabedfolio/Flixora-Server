import { GoogleGenAI, Type } from "@google/genai";
import Config from "../config/config";
import { Recommendation } from "../models/recommendation.model";

const genAI = new GoogleGenAI({
  apiKey: Config.GOOGLE_GEMINI_KEY,
});

/* =========================================
   AI SYSTEM INSTRUCTION
========================================= */

const systemInstruction = `
Analyze the user's movie activity and identify
their preferred movie genres and themes.

Return only genres and keywords.
Do not recommend specific movie titles.
`;

/* =========================================
   RESPONSE SCHEMA
========================================= */

const responseSchema = {
  type: Type.OBJECT,

  properties: {
    genres: {
      type: Type.ARRAY,

      items: {
        type: Type.STRING,
      },
    },

    keywords: {
      type: Type.ARRAY,

      items: {
        type: Type.STRING,
      },
    },
  },

  required: ["genres", "keywords"],
};

/* =========================================
   ANALYZE USER ACTIVITY
========================================= */

const analyzeUserActivity = async (activity: any) => {
  const prompt = `
    Analyze this user's movie activity:

    Watched:
    ${activity.history.join(", ")}

    Explored:
    ${activity.explored.join(", ")}

    Saved:
    ${activity.saved.join(", ")}

    Liked:
    ${activity.liked.join(", ")}

    Identify the movie genres and themes
    this user is likely to enjoy.
`;

  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash",

    contents: [
      {
        role: "user",

        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],

    config: {
      systemInstruction,

      responseMimeType: "application/json",

      responseSchema,

      thinkingConfig: {
        thinkingLevel: "minimal" as any,
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

/* =========================================
   TMDB
========================================= */

const getMoviesFromTMDB = async (preferences: any, excludeIds: number[]) => {
  const genreMap: Record<string, number> = {
    Action: 28,
    Adventure: 12,
    Animation: 16,
    Comedy: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    Horror: 27,
    Mystery: 9648,
    Romance: 10749,
    "Science Fiction": 878,
    Thriller: 53,
    War: 10752,
    Western: 37,
  };

  const genreIds = preferences.genres
    ?.map((genre: string) => genreMap[genre])
    .filter(Boolean);

  const params = new URLSearchParams({
    api_key: Config.TMDB_API_KEY,

    language: "en-US",

    sort_by: "popularity.desc",

    include_adult: "false",

    page: String(Math.floor(Math.random() * 5) + 1),
  });

  if (genreIds?.length) {
    params.append("with_genres", genreIds.join(","));
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?${params}`,
  );

  if (!response.ok) {
    throw new Error("TMDB request failed");
  }

  const data = await response.json();

  const movies = data.results.filter(
    (movie: any) => !excludeIds.includes(movie.id),
  );

  return movies.sort(() => Math.random() - 0.5).slice(0, 10);
};

/* =========================================
   CREATE RECOMMENDATION
========================================= */

export const createRecommendation = async (userId: string, activity: any) => {
  /* -----------------------------
       1. Check existing recommendation
    ----------------------------- */

  const existing = await Recommendation.findOne({
    userId,
  });

  if (existing && existing.expiresAt && existing.expiresAt > new Date()) {
    return existing;
  }

  /* -----------------------------
       2. AI analyzes activity
    ----------------------------- */

  const preferences = await analyzeUserActivity(activity);

  /* -----------------------------
       3. Collect watched IDs
    ----------------------------- */

  const excludeIds = [
    ...activity.history,
    ...activity.explored,
    ...activity.saved,
    ...activity.liked,
  ];

  /* -----------------------------
       4. Get movies from TMDB
    ----------------------------- */

  const movies = await getMoviesFromTMDB(preferences, excludeIds);

  const movieIds = movies.map((movie: any) => movie.id);

  /* -----------------------------
       5. Save recommendation
    ----------------------------- */

  const recommendation = await Recommendation.findOneAndUpdate(
    { userId },

    {
      userId,

      movieIds,

      preferences,

      basedOn: {
        history: activity.history,

        explored: activity.explored,

        saved: activity.saved,

        liked: activity.liked,
      },

      generatedAt: new Date(),

      // Cache for 24 hours
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },

    {
      new: true,
      upsert: true,
    },
  );

  return recommendation;
};
