import { GoogleGenAI, Type } from "@google/genai";
import Config from "../config/config";

const genAI = new GoogleGenAI({
  apiKey: Config.GOOGLE_GEMINI_KEY,
});

/* =========================================
   SYSTEM INSTRUCTION
========================================= */
const systemInstruction = `
Analyze the user's movie request and return relevant TMDB filters.
Treat emotions like sad, happy, lonely, or exciting as mood, not genres.
Choose relevant genres and keywords based on the user's intent.
Do not invent unrelated filters.
`;

/* =========================================
   RESPONSE SCHEMA
========================================= */

const responseSchema = {
  type: Type.OBJECT,

  properties: {
    mood: {
      type: Type.STRING,
      description:
        "The user's emotional intent, such as sad, happy, lonely, exciting, relaxing.",
    },

    genres: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description:
        "Relevant TMDB movie genres such as drama, romance, comedy, thriller, horror, science fiction.",
    },

    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description:
        "Useful movie-related concepts or themes. Avoid using emotions alone as keywords.",
    },

    year: {
      type: Type.INTEGER,
      description:
        "Specific release year if the user mentions one. Otherwise do not provide it.",
    },
  },

  required: ["mood", "genres", "keywords"],
};


/* =========================================
   GEMINI MOVIE FILTER GENERATOR
========================================= */

export const generateMovieFilters = async (prompt: string) => {
  try {
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
      },
    });

    console.log("Gemini Usage:", response.usageMetadata);

    return JSON.parse(response.text || "{}");

  } catch (error: any) {
    console.error("Gemini Movie AI Error:", error);

    throw error;
  }
};