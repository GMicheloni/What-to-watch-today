import { Router } from "express";
import { getMovieDetailsController, searchController, } from "../controllers/searchController.js";
import { get } from "node:http";
const router = Router();
router.get("/api/search", searchController);
router.get("/api/movie/:id", getMovieDetailsController);
export default router;
//# sourceMappingURL=index.js.map