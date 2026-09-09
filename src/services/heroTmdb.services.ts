import axios from "axios";
import Config from "../config/config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const TMDB_GENRES: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  "science-fiction": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

const SORT_OPTIONS = [
  "popularity.desc",
  "vote_average.desc",
  "revenue.desc",
  "primary_release_date.desc",
];

export const searchMoviesForAI = async (filters: any) => {
  /* ==============================
     Convert Genres → TMDB IDs
  ============================== */
  const genreIds = (filters?.genres || [])
    .map((genre: string) => TMDB_GENRES[genre.toLowerCase().trim()])
    .filter(Boolean);

  /* ==============================
     Random Page & Sort
  ============================== */
  const randomPage = Math.floor(Math.random() * 3) + 1; // 1 to 3 to ensure results exist
  const randomSort = SORT_OPTIONS[Math.floor(Math.random() * SORT_OPTIONS.length)];

  /* ==============================
     TMDB Parameters
  ============================== */
  const params: any = {
    api_key: Config.TMDB_API_KEY,
    language: "en-US",
    page: randomPage,
    sort_by: randomSort,
    include_adult: false,
    vote_count_gte: 100, // Avoid obscure/unrated movies
  };

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(",");
  }

  if (filters?.year) {
    params.primary_release_year = filters.year;
  }

  try {
    let response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });

    // Fallback: If random page had no results, fetch page 1
    if (!response.data.results || response.data.results.length === 0) {
      params.page = 1;
      response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
    }

    let results = response.data.results || [];

    /* ==============================
       Shuffle Results
    ============================== */
    const shuffledMovies = [...results].sort(() => Math.random() - 0.5);

    /* ==============================
        Format & Return Top 6 Movies with Specific Fields
    ============================== */
    const topSixMovies = shuffledMovies.slice(0, 6).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path : movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      media_type : movie.media_type,
    }));

    return topSixMovies;
  } catch (error: any) {
    console.error("TMDB Discover API Error:", error.message || error);
    return [];
  }
};
