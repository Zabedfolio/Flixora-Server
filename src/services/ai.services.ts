import { GoogleGenAI, Type } from "@google/genai";
import Config from "../config/config";

import { searchMovie, getSimilarMovies } from "./tmdb.services";

const movieTools = [
  {
    functionDeclarations: [
      {
        name: "searchMovie",

        description: "Search movies from TMDB by movie title.",

        parameters: {
          type: Type.OBJECT,

          properties: {
            query: {
              type: Type.STRING,
              description: "The movie title to search for.",
            },
          },

          required: ["query"],
        },
      },

      {
        name: "getSimilarMovies",

        description: "Get movies similar to a specific TMDB movie.",

        parameters: {
          type: Type.OBJECT,

          properties: {
            movieId: {
              type: Type.NUMBER,
              description: "The TMDB ID of the movie.",
            },
          },

          required: ["movieId"],
        },
      },
    ],
  },
] as const;

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

async function executeTool(name: string, args: any) {
  switch (name) {
    case "searchMovie":
      return await searchMovie(args.query);

    case "getSimilarMovies":
      return await getSimilarMovies(args.movieId);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function generateMovieResponse(prompt: string) {
  try {
    let contents: any[] = [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    while (true) {
      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",

        contents,

        config: {
          systemInstruction,
          tools: movieTools,
        },
      });

      const functionCalls = response.functionCalls;

      // Gemini যদি কোনো function call না করে
      if (!functionCalls?.length) {
        return {
          message: response.text || "",
          movies: [],
        };
      }

      // Gemini যে function call করেছে
      for (const call of functionCalls) {
        console.log("Gemini Tool Call:", call.name, call.args);

        const toolResult = await executeTool(call.name!, call.args);

        console.log("TMDB Tool Result:", toolResult);

        // Gemini-এর conversation-এ
        // আগের model response যোগ করছি
        contents.push({
          role: "model",
          parts: [
            {
              functionCall: {
                name: call.name,
                args: call.args, 
              },
            },
          ],
        });

        // function result return to the gemini 1.Insertion 
        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: {
                  result: toolResult,
                },
              },
            },
          ],
        });
      }

      // loop again Gemini call
    }
  } catch (error: any) {
    console.error("Gemini Movie AI Error:", error);

    throw error;
  }
}
