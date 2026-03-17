const OLLAMA_URL = "http://localhost:11434/api/generate";

export const generateWithOllama = async (prompt: string) => {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText} - ${bodyText}`,
    );
  }

  const data = await response.json();

  if (!data || typeof data.response !== "string") {
    throw new Error(
      `Ollama response invalid format: ${JSON.stringify(data, null, 2)}`,
    );
  }

  return data.response;
};
