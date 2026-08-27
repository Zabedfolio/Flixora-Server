import { Request, Response } from "express";
import { searchMovie } from "../services/tmdb.services";
import { generateMovieResponse, getSearchKeywords } from "../services/ai.services";
import axios from "axios";
import Config from "../config/config";

export const searchMovieWithQueary = async (req:Request, res:Response): Promise<void> => {
    try{
        const {query} = req.body;
        const movie = await searchMovie(`${query}`)
        console.log(movie);
        res.status(200).json(movie)
    }
    catch (err)
    {
        console.log('Something went to wrong from AI controller!.');
        res.status(401).json({
            message: 'Something problem in the searchMovieWithQueary controller.'
        })
    }
}

// export const movieAssistant = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {

//   try {

//     const { message } = req.body;

//     if (!message?.trim()) {

//       res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });

//       return;
//     }

//     const response =
//       await searchMovie(message);

//     // res.status(200).json({
//     //   success: true,
//     //   data: response,
//     // });
//     console.log(response);
//     res.send(response)

//   } catch (error) {

//     console.error(
//       "AI Controller Error:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message:
//         "Something went wrong with Flixora AI.",
//     });
//   }
// };

export async function movieAssistant(req:Request, res:Response) {
  try {
    const { prompt } = req.body; // User asked: "Suggest me movies like Interstellar"

    // 1. Find keyword/search query from user asked using by AI 
    const { searchQuery } = await getSearchKeywords(prompt);

    // 2. Call TMDB movie API by AI given keyword 
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${Config.TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
    );

    const firstMovie = tmdbResponse.data.results[0];

    let recommendedMovies = [];
    if (firstMovie) {
      // 3. Call the Similar/Recommendations API with the first movie ID.
      const recommendationResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${firstMovie.id}/recommendations?api_key=${Config.TMDB_API_KEY}`
      );
      recommendedMovies = recommendationResponse.data.results;
    }

    // 4. Send TMDB API result to the frontend  
    return res.json({
      success: true,
      keywordUsed: searchQuery,
      movies: recommendedMovies,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}