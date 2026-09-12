import axios from "axios";
import Config from "../config/config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${Config.TMDB_ACCESS_TOKEN || Config.TMDB_API_KEY}`,
  },
  params: {
    api_key: Config.TMDB_API_KEY,
  },
});

/**
 * Normalizes a raw TMDB media item into a minimal schema for Gemini.
 * Strips out heavy metadata: poster_path, backdrop_path, vote_count, popularity, adult, etc.
 */
export function normalizeTMDBItem(item: any) {
  if (!item) return null;

  return {
    id: item.id,
    title:
      item.title ||
      item.name ||
      item.original_title ||
      item.original_name ||
      "Unknown",
    mediaType: item.media_type || (item.title ? "movie" : "tv"),
    overview: item.overview
      ? item.overview.slice(0, 150) + "..."
      : "No overview available.",
    poster: item.poster_path
      ? `${TMDB_POSTER_BASE_URL}${item.poster_path}`
      : item.poster || null,
    releaseDate: item.release_date || item.first_air_date || "N/A",
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : "N/A",
    genres: item.genres
      ? item.genres.map((g: any) => g.name)
      : item.genre_ids || [],
    runtime: item.runtime
      ? `${item.runtime} mins`
      : item.episode_run_time
        ? `${item.episode_run_time[0]} mins`
        : undefined,
  };
}

/**
 * Normalizes lists or single objects from TMDB responses.
 * Limits array output to top 5 items max to preserve token quota.
 */
export function normalizeTMDBResponse(data: any) {
  if (!data) return [];

  const items = Array.isArray(data.results) ? data.results : [data];
  return items.slice(0, 5).map(normalizeTMDBItem).filter(Boolean);
}

export const aiChatTmdbService = {
  async searchMedia(query: string, mediaType: string = "all") {
    const endpoint =
      mediaType === "tv"
        ? "/search/tv"
        : mediaType === "movie"
          ? "/search/movie"
          : "/search/multi";

    const response = await tmdbClient.get(endpoint, {
      params: { query, page: 1 },
    });
    return normalizeTMDBResponse(response.data);
  },

  async discoverMovies(filters: {
    mediaType?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    language?: string;
  }) {
    const targetType = filters.mediaType === "tv" ? "tv" : "movie";
    const params: Record<string, any> = { page: 1, sort_by: "popularity.desc" };

    if (filters.year) {
      if (targetType === "movie") params.primary_release_year = filters.year;
      else params.first_air_date_year = filters.year;
    }

    if (filters.minRating) {
      params["vote_average.gte"] = filters.minRating;
    }

    if (filters.language) {
      params.with_original_language = filters.language;
    }

    const response = await tmdbClient.get(`/discover/${targetType}`, {
      params,
    });
    return normalizeTMDBResponse(response.data);
  },

  async getMovieDetails(id: number, mediaType: string = "movie") {
    const targetType = mediaType === "tv" ? "tv" : "movie";
    const response = await tmdbClient.get(`/${targetType}/${id}`);
    return normalizeTMDBResponse(response.data);
  },

  async getTrending(mediaType: string = "all", timeWindow: string = "week") {
    const response = await tmdbClient.get(
      `/trending/${mediaType}/${timeWindow}`,
    );
    return normalizeTMDBResponse(response.data);
  },

  async searchPerson(name: string) {
    const response = await tmdbClient.get(`/search/person`, {
      params: { query: name },
    });
    return normalizeTMDBResponse(response.data);
  },
};
