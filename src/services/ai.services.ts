import { GoogleGenAI } from "@google/genai";
import Config from "../config/config";

import {
  searchMovie,
  getSimilarMovies,
} from "./tmdb.services";

const movieTools = [
  {
    functionDeclarations: [
      {
        name: "searchMovie",

        description:
          "Search movies from TMDB by movie title.",

        parameters: {
          type: "OBJECT",

          properties: {
            query: {
              type: "STRING",
              description: "The movie title to search for.",
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
              description:
                "The TMDB ID of the movie.",
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
3. Always use TMDB tools when real movie information is required.
4. If the user mentions a movie title, use searchMovie first.
5. If the user asks for movies similar to a movie,
   first find the movie using searchMovie,
   then use getSimilarMovies.
6. Only recommend movies returned by TMDB.
7. Give a short reason for each recommendation.
8. Be friendly and concise.
9. If you cannot find a movie, clearly tell the user.
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


async function executeTool(
  name: string,
  args: any
) {
  switch (name) {

    case "searchMovie":
      return await searchMovie(args.query);

    case "getSimilarMovies":
      return await getSimilarMovies(args.movieId);

    default:
      throw new Error(
        `Unknown tool: ${name}`
      );
  }
}




