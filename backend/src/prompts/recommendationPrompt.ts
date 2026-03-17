export const buildRecommendationPrompt = (movies: string[]) => `
You are a movie recommendation engine.

Movies:
${movies.join("\n")}

For each movie recommend one similar movie.

Return ONLY valid JSON with the following format:

{
  "recommendations": [
    {
      "input_movie": "",
      "recommended_movie": "",
      "year": "",
      "reason": ""
    }
  ]
}
`;
