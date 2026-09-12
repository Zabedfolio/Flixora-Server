import { Type, FunctionDeclaration } from '@google/genai';

/**
 * 1. searchMedia
 * Search for movies, TV shows, or anime by title or keywords.
 */
export const searchMediaDeclaration: FunctionDeclaration = {
  name: 'searchMedia',
  description: 'Search TMDB for movies, TV shows, or anime by title, franchise name, or keyword.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search term, title, or keyword (e.g., "Interstellar", "Naruto", "Avengers").',
      },
      mediaType: {
        type: Type.STRING,
        description: 'Optional target media type. Allowed values: "movie", "tv", "all". Default is "all".',
      },
    },
    required: ['query'],
  },
};

/**
 * 2. discoverMovies
 * Discover movies or TV shows based on granular filters (genre, year, minimum rating, language).
 */
export const discoverMoviesDeclaration: FunctionDeclaration = {
  name: 'discoverMovies',
  description: 'Discover movies or TV shows using filters like genre, release year, minimum vote average rating, and language.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      mediaType: {
        type: Type.STRING,
        description: 'Filter by "movie" or "tv". Default is "movie".',
      },
      genre: {
        type: Type.STRING,
        description: 'Genre identifier or name (e.g., "Action", "Sci-Fi", "Comedy", "Animation", "Drama").',
      },
      year: {
        type: Type.NUMBER,
        description: 'Specific release year (e.g., 2020, 2023).',
      },
      minRating: {
        type: Type.NUMBER,
        description: 'Minimum user rating threshold from 1.0 to 10.0 (e.g., 7.5).',
      },
      language: {
        type: Type.STRING,
        description: 'ISO-639-1 language code (e.g., "en", "ja" for Anime, "ko" for K-Drama).',
      },
    },
    required: [],
  },
};

/**
 * 3. getMovieDetails
 * Retrieve specific metadata for a single movie or TV show by TMDB ID.
 */
export const getMovieDetailsDeclaration: FunctionDeclaration = {
  name: 'getMovieDetails',
  description: 'Fetch detailed information about a specific movie or TV show using its TMDB ID, including plot overview, release date, runtime, genres, and main cast.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.NUMBER,
        description: 'The TMDB ID of the movie or TV show.',
      },
      mediaType: {
        type: Type.STRING,
        description: 'Media type: "movie" or "tv". Default is "movie".',
      },
    },
    required: ['id'],
  },
};

/**
 * 4. getTrending
 * Retrieve current trending movies or TV shows.
 */
export const getTrendingDeclaration: FunctionDeclaration = {
  name: 'getTrending',
  description: 'Get list of currently trending movies, TV shows, or anime.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      mediaType: {
        type: Type.STRING,
        description: 'Target type: "movie", "tv", or "all". Default is "all".',
      },
      timeWindow: {
        type: Type.STRING,
        description: 'Time period for trends: "day" or "week". Default is "week".',
      },
    },
    required: [],
  },
};

/**
 * 5. searchPerson
 * Search for actors, directors, or crew members and retrieve their known work.
 */
export const searchPersonDeclaration: FunctionDeclaration = {
  name: 'searchPerson',
  description: 'Search for actors, directors, writers, or crew members to find their biography and top filmography/TV credits.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'Full name of the person (e.g., "Christopher Nolan", "Leonardo DiCaprio").',
      },
    },
    required: ['name'],
  },
};

// Bundle all declarations into Flixora Tools array
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
