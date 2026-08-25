import { GoogleGenAI } from "@google/genai";
import Config from "../config/config";

const movieTools = [
  {
    functionDeclarations: [
      {
        name: "searchMovie",

        description:
          "Search for movies from TMDB by title.",

        parameters: {
          type: "OBJECT",

          properties: {
            query: {
              type: "STRING",
              description: "Movie title",
            },
          },

          required: ["query"],
        },
      },

      {
        name: "getSimilarMovies",

        description:
          "Get movies similar to a specific TMDB movie.",

        parameters: {
          type: "OBJECT",

          properties: {
            movieId: {
              type: "NUMBER",
              description: "TMDB movie ID",
            },
          },

          required: ["movieId"],
        },
      },
    ],
  },
];
const systemInstruction = `
You are Flixora AI, an intelligent movie recommendation assistant.

Your job is to help users discover movies.

Rules:

1. Never invent movie information.
2. Never invent TMDB IDs.
3. Use TMDB tools whenever actual movie data is required.
4. If the user asks for a specific movie, search TMDB first.
5. If the user asks for similar movies, use the similar movie tool.
6. If the user provides filters such as genre, year, rating, runtime or language,
   use the appropriate TMDB search/discovery tool.
7. Recommend movies based on the user's request.
8. Explain briefly why each movie matches.
9. Keep the response friendly and concise.
`;
const genAI = new GoogleGenAI({
  apiKey: Config.GOOGLE_GEMINI_KEY,
});

async function generateContent(prompt: string) {

  const result = await genAI.models.generateContent({
    model: "gemini-3.5-flash",

    contents: prompt,

    config: {
      systemInstruction,
      tools: movieTools,
    },
  });

  return result;
}



