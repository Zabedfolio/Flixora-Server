import { Router } from "express";
import { movieAssistant, getGenreRecommendations } from "../controllers/ai.controller";

const router = Router();

/**
 * @route    POST /api/ai/chat
 * @desc     Generate AI chatbot response & save history to MongoDB
 * @access   public
 */
router.post("/ai/chat", movieAssistant);

/**
 * @route    /api/ai/recommendations
 * @desc     Generate AI movie recommendations from watch history genres
 * @access   public
 */
router.post("/ai/recommendations", getGenreRecommendations);

export default router;

