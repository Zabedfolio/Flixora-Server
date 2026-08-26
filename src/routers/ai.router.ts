import { Router } from "express";
import {
  movieAssistant,
  searchMovieWithQueary,
} from "../controllers/ai.controller";

const router = Router();

router.get("/search/movie", searchMovieWithQueary);
router.post("/ai/chat", movieAssistant);

export default router;
