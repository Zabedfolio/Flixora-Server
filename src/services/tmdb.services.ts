import axios from "axios";
import Config from "../config/config";

// create tmdb instance
const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${Config.TMDB_ACCESS_TOKEN}`,
    accept: "application/json",
  },
});

// search movie
export const searchMovie = async (query: string) => {
  const { data } = await tmdb.get("/search/movie", {
    params: {
      query,
      include_adult: false,
      language: "en-US",
    },
  });
  let store =  data.results.slice(0, 10);
  console.log(store);
  return store
};

// similar movie
export const getSimilarMovies = async (movieId: number) => {
  const { data } = await tmdb.get(`/movie/${movieId}/recommendations`, {
    params: {
      language: "en-US",
    },
  });

  return data.results.slice(0, 10);
};
