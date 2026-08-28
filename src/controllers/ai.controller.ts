import { Request, Response } from "express";
import { getSimilarMovies, searchMovie } from "../services/tmdb.services";
import { generateMovieResponse, getSearchKeywords } from "../services/ai.services";

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
    const { message } = req.body; // User asked: "Suggest me movies like Interstellar"

    // 1. Find keyword/search query from user asked using by AI 
    const { searchQuery } = await getSearchKeywords(message);
    
    // 2. Call TMDB movie API by AI given keyword 
    const data =  await searchMovie(searchQuery)

    // select first movie for the first movie ID 
    const firstMovie = data.results[0];

    let recommendedMovies = [];
    if (firstMovie) {
      // 3. Call the Similar/Recommendations API with the first movie ID.
      const responseRecommended = await getSimilarMovies(firstMovie.id)
      recommendedMovies = responseRecommended.results;
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