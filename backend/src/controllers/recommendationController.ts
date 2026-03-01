import type { Request, Response } from "express";
import { recommendationsService } from "../services/recommendationsService.js";

export const recommendationController = async (req: Request, res: Response) => {
  //vamos a recibir el nombre de las peliculas para preguntar a la ia recomendaciones similares
  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: "Request body is required." });
  }
  try {
    const results = await recommendationsService(body);
    return res.status(200).json(results);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching recommendations." });
  }
};
