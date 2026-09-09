import { Router } from "express";
import { getChatHistory, clearChatHistory, getGenreRecommendations } from "../controllers/ai.controller";
import { movieAssistant } from "../controllers/heroAi.controller";

const router = Router();

/**
 * @route    POST /api/ai/chat
 * @desc     Generate AI chatbot response & save history to MongoDB
 * @access   public
 */
router.post("/ai/chat", movieAssistant);

/**
 * @route    GET /api/ai/chat/history
 * @desc     Retrieve chat history from MongoDB
 * @access   public
 */
router.get("/ai/chat/history", getChatHistory);

/**
 * @route    DELETE /api/ai/chat/history
 * @desc     Clear chat history from MongoDB
 * @access   public
 */
router.delete("/api/ai/chat/history", clearChatHistory);
//  * @route    /api/ai/recommendations
//  * @desc     Generate AI movie recommendations from watch history genres
//  * @access   public
//  */
router.post("/ai/recommendations", getGenreRecommendations);

export default router;

