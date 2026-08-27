import { GoogleGenAI, Type, Schema } from "@google/genai";
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

async function executeTool(name: string, args: any) {
  switch (name) {
    case "searchMovie":
      return await searchMovie(args.query);

    case "getSimilarMovies":
      return await getSimilarMovies(args.movieId);

    default:
      throw new Error(`Unknown function: ${name}`);
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

      const modelParts = response.candidates?.[0]?.content?.parts;

      if (!modelParts) {
        throw new Error("Gemini returned no response parts");
      }

      /*
       * IMPORTANT:
       * exactly original model response preserve
       * do not recreate functionCall manually
       */
      contents.push({
        role: "model",
        parts: modelParts,
      });

      /*
       * Gemini  function call
       */
      const functionCalls = response.functionCalls;

      /*
       * Due to leak of function call
       * This is the final response.
       */
      if (!functionCalls?.length) {
        return {
          message: response.text || "",
          movies: functionCalls,
        };
      }

      /*
       * execute every function
       */
      for (const call of functionCalls) {
        console.log("Gemini Function Call:", call.name, call.args);

        const toolResult = await executeTool(call.name!, call.args);

        console.log("TMDB Result:", toolResult);

        /*
         * Function result returned to the gemini
         * Return to the function
         */
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
    }
  } catch (error) {
    console.error("Gemini Movie AI Error:", error);

    throw error;
  }
}

export async function getSearchKeywords(userPrompt: string) {
  // Format of the AI answer 
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      searchQuery: {
        type: Type.STRING,
        description: "Main movie title or search phrase extracted from prompt",
      },
      genres: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of genres associated with the request",
      },
    },
    required: ["searchQuery"],
  };

  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction:
        "You are a keyword extractor for a movie search engine. Extract the core movie title, topic, or search query.",
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  // Response AI just a little JSON { "searchQuery": "Interstellar", "genres": ["sci-fi"] }
  return JSON.parse(response.text || "{}");
}
