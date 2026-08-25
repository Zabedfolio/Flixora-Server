import { Request, Response } from "express";
import { searchMovie } from "../services/tmdb.services";
import { generateMovieResponse } from "../services/ai.services";

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



export const movieAssistant = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { message } = req.body;

    if (!message?.trim()) {

      res.status(400).json({
        success: false,
        message: "Message is required",
      });

      return;
    }

    const response =
      await generateMovieResponse(message);

    res.status(200).json({
      success: true,
      data: response,
    });

  } catch (error) {

    console.error(
      "AI Controller Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong with Flixora AI.",
    });
  }
};