import { Request, Response } from "express";
import { searchMovie } from "../services/tmdb.services";


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