import axios from "axios";
import Config from "../config/config";

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${Config.TMDB_ACCESS_TOKEN}`,
    accept: "application/json",
  },
});

// Search movie
export const searchMovie = async (query: string) => {
  const { data } = await tmdb.get("/search/movie", {
    params: {
      query,
      include_adult: false,
      language: "en-US",
    },
  });

  return data.results.slice(0, 10);
};

// Similar movies
export const getSimilarMovies = async (movieId: number) => {
  const { data } = await tmdb.get(
    `/movie/${movieId}/recommendations`,
    {
      params: {
        language: "en-US",
      },
    }
  );

  return data.results.slice(0, 10);
};