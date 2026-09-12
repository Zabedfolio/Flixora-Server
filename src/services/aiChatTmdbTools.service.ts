import { Type, FunctionDeclaration } from "@google/genai";
import { aiChatTmdbService } from "./aiChatTmdbFunc.service";


export const searchMediaDeclaration: FunctionDeclaration = {
  name: "searchMedia",
  description:
    "Search TMDB for movies, TV shows, or anime by title, franchise name, or keyword.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search term (e.g., "Interstellar").',
      },
      mediaType: {
        type: Type.STRING,
        description: 'Target media type: "movie", "tv", or "all".',
      },
    },
    required: ["query"],
  },
};

export const discoverMoviesDeclaration: FunctionDeclaration = {
  name: "discoverMovies",
  description:
    "Discover movies or TV shows using filters like genre, release year, min rating, and language.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mediaType: {
        type: Type.STRING,
        description: 'Filter by "movie" or "tv".',
      },
      genre: {
        type: Type.STRING,
        description: 'Genre name (e.g., "Action", "Sci-Fi").',
      },
      year: { type: Type.NUMBER, description: "Specific release year." },
      minRating: {
        type: Type.NUMBER,
        description: "Minimum rating threshold (1-10).",
      },
      language: {
        type: Type.STRING,
        description: 'ISO language code (e.g., "en", "ja").',
      },
    },
  },
};

export const getMovieDetailsDeclaration: FunctionDeclaration = {
  name: "getMovieDetails",
  description:
    "Fetch detailed info about a specific movie or TV show using its TMDB ID.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER, description: "TMDB ID." },
      mediaType: { type: Type.STRING, description: '"movie" or "tv".' },
    },
    required: ["id"],
  },
};

export const getTrendingDeclaration: FunctionDeclaration = {
  name: "getTrending",
  description: "Get list of currently trending movies, TV shows, or anime.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mediaType: { type: Type.STRING, description: '"movie", "tv", or "all".' },
      timeWindow: { type: Type.STRING, description: '"day" or "week".' },
    },
  },
};

export const searchPersonDeclaration: FunctionDeclaration = {
  name: "searchPerson",
  description: "Search for actors, directors, or writers.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Full name of the person." },
    },
    required: ["name"],
  },
};

export const flixoraTools = [
  {
    functionDeclarations: [
      searchMediaDeclaration,
      discoverMoviesDeclaration,
      getMovieDetailsDeclaration,
      getTrendingDeclaration,
      searchPersonDeclaration,
    ],
  },
];

export async function executeTMDBTool(name: string, args: any) {
  try {
    switch (name) {
      case "searchMedia":
        return await aiChatTmdbService.searchMedia(args.query, args.mediaType);
      case "discoverMovies":
        return await aiChatTmdbService.discoverMovies(args);
      case "getMovieDetails":
        return await aiChatTmdbService.getMovieDetails(args.id, args.mediaType);
      case "getTrending":
        return await aiChatTmdbService.getTrending(
          args.mediaType,
          args.timeWindow,
        );
      case "searchPerson":
        return await aiChatTmdbService.searchPerson(args.name);
      default:
        throw new Error(`Unrecognized tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Tool Execution Error [${name}]:`, error?.message || error);
    return [];
  }
}
