import { Router } from "express";
import { movieAssistant } from "../controllers/ai.controller";

const router = Router();

/**
 * @route    /api/ai/chat
 * @desc     Response between AI and tmd filtering 
 * @access   public
 */
router.post("/ai/chat", movieAssistant);

export default router;
