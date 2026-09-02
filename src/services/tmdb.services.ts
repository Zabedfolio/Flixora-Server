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
];

export const searchMoviesForAI = async (
  filters: any
) => {

  /* ==============================
     Convert Genres → TMDB IDs
  ============================== */

  const genreIds = (filters.genres || [])
    .map((genre: string) => {
      return TMDB_GENRES[genre.toLowerCase()];
    })
    .filter(Boolean);


  /* ==============================
     Random Page
  ============================== */

  const randomPage =
    Math.floor(Math.random() * 5) + 1;


  /* ==============================
     Random Sorting
  ============================== */

  const randomSort =
    SORT_OPTIONS[
      Math.floor(
        Math.random() * SORT_OPTIONS.length
      )
    ];


  /* ==============================
     TMDB Parameters
  ============================== */

  const params: any = {
    api_key: Config.TMDB_API_KEY,

    language: "en-US",

    page: randomPage,

    sort_by: randomSort,

    include_adult: false,

    // Avoid extremely low-rated movies
    vote_count_gte: 100,
  };


  if (genreIds.length > 0) {
    params.with_genres = genreIds.join("|");
  }


  if (filters.year) {
    params.primary_release_year = filters.year;
  }


  const response = await axios.get(
    `${TMDB_BASE_URL}/discover/movie`,
    {
      params,
    }
  );


  /* ==============================
     Shuffle Results
  ============================== */

  const movies = [...response.data.results].sort(
    () => Math.random() - 0.5
  );


  /* ==============================
     Return 6 Movies
  ============================== */

  return movies.slice(0, 6);
};