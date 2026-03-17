import { Router } from "express";
import {
  getMovieDetailsController,
  searchController,
} from "../controllers/searchController.js";
import { recommendationController } from "../controllers/recommendationController.js";
import { searchLimiter } from "../middlewares/rateLimit.js";

const router: Router = Router();

router.get("/api/search", searchLimiter, searchController);
router.get("/api/movie/:id", getMovieDetailsController);
router.post("/api/recommendation", recommendationController);

export default router;
