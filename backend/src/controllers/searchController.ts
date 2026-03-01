import type { Request, Response } from "express";
import {
  getMovieDetailsService,
  searchService,
} from "../services/searchService.js";

export const searchController = async (req: Request, res: Response) => {
  const query: string = (req.query.q as string)?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }
  try {
    const results = await searchService(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while searching." });
  }
};

export const getMovieDetailsController = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  const movieId = Number(id);
  if (!id || Number.isNaN(movieId)) {
    return res.status(400).json({ error: "Movie ID inválido" });
  }
  try {
    const movieDetails = await getMovieDetailsService(movieId);
    if (!movieDetails) {
      return res.status(404).json({ error: "Movie not found." });
    }
    res.status(200).json(movieDetails);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching movie details." });
  }
};
