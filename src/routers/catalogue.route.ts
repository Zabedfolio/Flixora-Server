import { Router } from "express";
import { getCatalogueStats } from "../controllers/catalogue.controller";

const router = Router();

router.get("/catalogue/stats", getCatalogueStats);

export default router;