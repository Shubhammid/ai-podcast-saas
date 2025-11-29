import { GoogleGenerativeAI } from "@google/generative-ai";

export const googleAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export async function geminiJson(
  model: string,
  messages: { role: string; content: string }[],
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
  return schema.parse(json);
}
