import { Router } from "express";
import { searchMovieWithQueary } from "../controllers/ai.controller";


const router = Router()

router.get('/search/movie', searchMovieWithQueary)


export default router

