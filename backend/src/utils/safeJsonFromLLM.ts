export function safeJsonFromLLM(text: string) {
  if (!text) {
    throw new Error("Empty LLM response");
  }

  // 1️⃣ intentar parsear directo
  try {
    return JSON.parse(text);
  } catch {}

  // 2️⃣ remover markdown ```json ```
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3️⃣ extraer el primer bloque JSON
  const match = cleaned.match(/\{[\s\S]*\}/);

  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }

  throw new Error("Could not parse JSON from LLM response");
}
