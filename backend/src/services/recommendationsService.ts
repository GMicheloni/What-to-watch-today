import type { IRecommendationRequest } from "../dtos/recommendationsDto.js";
import { safeJsonFromLLM } from "../utils/safeJsonFromLLM.js";
import { generateWithOllama } from "../ia/ollamaClient.js";
import { buildRecommendationPrompt } from "../prompts/recommendationPrompt.js";
import { searchService } from "./searchService.js";

export const recommendationsService = async (body: IRecommendationRequest) => {
  const { movies } = body;

  const prompt = buildRecommendationPrompt(movies);

  try {
    const rawResponse = await generateWithOllama(prompt);

    const parsedData = safeJsonFromLLM(rawResponse);

    if (
      !parsedData ||
      typeof parsedData !== "object" ||
      !Array.isArray(parsedData.recommendations)
    ) {
      console.error("Invalid recommendations payload from LLM:", parsedData);
      throw new Error("Invalid recommendation data format from LLM.");
    }

    const enrichedRecommendations = await Promise.all(
      parsedData.recommendations.map(async (r: any) => {
        const year = String(r.year || "").trim();

        const results = await searchService(r.recommended_movie || "");

        const movie =
          results.find((m) => m.release_date?.startsWith(year)) || results[0];

        return {
          input_movie: r.input_movie || "",
          movie,
          reason: r.reason || "No reason provided",
        };
      }),
    );

    return enrichedRecommendations;
  } catch (error) {
    console.error("Error fetching recommendations:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    throw new Error("Failed to fetch recommendations");
  }
};
