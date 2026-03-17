import type { Request, Response } from "express";
import { recommendationsService } from "../services/recommendationsService.js";

export const recommendationController = async (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "Request body is required." });
  }
  if (!body.movies || !Array.isArray(body.movies) || body.movies.length === 0) {
    return res.status(400).json({
      error: "Movies field is required and should be a non-empty array.",
    });
  }
  try {
    const results = await recommendationsService(body);
    console.log(results);
    return res.status(200).json(results);
  } catch (error) {
    console.error("recommendationController error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching recommendations.",
    });
  }
};
