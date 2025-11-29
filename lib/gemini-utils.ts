import { googleAI } from "@/lib/gemini-client";

export async function geminiJson(
  model: string,
  messages: any[],
  schema: any
) {
  const genAI = googleAI.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const result = await genAI.generateContent(prompt);
  const text = result.response.text();

  const json = JSON.parse(text);
  return schema.parse ? schema.parse(json) : json;
}
