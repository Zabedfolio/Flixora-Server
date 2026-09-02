import { Router } from "express";
import { addWatchedMovie, getUserGenres } from "../controllers/movieActivity.controller";

const ActivityRouter = Router()

/**
 * @route    /api/activity/watch
 * @desc     save user watch history 
 * @access   private
 */
ActivityRouter.post('/activity/watch',addWatchedMovie)
ActivityRouter.get('/activity/watch-get',getUserGenres)

export default ActivityRouter