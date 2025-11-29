import type { step as InngestStep } from "inngest";
import { googleAI } from "@/lib/gemini-client";
import { type Summary, summarySchema } from "@/schemas/ai-outputs";
import type { TranscriptWithExtras } from "@/types/assemblyai";

const SUMMARY_SYSTEM_PROMPT = `
You are an expert podcast content analyst and marketing strategist.
Your summaries are engaging, insightful, structured, and highlight the most valuable takeaways.
Always return valid JSON.
`;

function buildSummaryPrompt(transcript: TranscriptWithExtras): string {
  return `
Analyze this podcast transcript and create a structured summary package.

TRANSCRIPT (first 3000 chars):
${transcript.text.substring(0, 3000)}...

${
  transcript.chapters.length > 0
    ? `AUTO-DETECTED CHAPTERS:
${transcript.chapters
  .map((ch, idx) => `${idx + 1}. ${ch.headline} - ${ch.summary}`)
  .join("\n")}`
    : ""
}

Create a summary with:

1. FULL OVERVIEW (200–300 words)
2. KEY BULLET POINTS (5–7 items)
3. ACTIONABLE INSIGHTS (3–5 items)
4. TL;DR (one compelling sentence)

Return JSON matching this structure:
{
  "full": string,
  "bullets": string[],
  "insights": string[],
  "tldr": string
}

No extra commentary.
`;
}

export async function generateSummary(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Summary> {
  console.log("Generating summary with Gemini");

  try {
    // Gemini wrapper function for Inngest
    const createGeminiCall = async (args: any) => {
      const model = googleAI.getGenerativeModel({
        model: args.model,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = args.messages
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

      const result = await model.generateContent(prompt);
      return { content: result.response.text() };
    };

    // Run through Inngest step wrapper
    const response = await step.ai.wrap(
      "generate-summary-gemini",
      createGeminiCall,
      {
        model: "gemini-2.0-flash", // or gemini-2.0-pro
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: buildSummaryPrompt(transcript) },
        ],
      }
    );

    const raw = response.content;
    const parsed = summarySchema.parse(JSON.parse(raw));

    return parsed;
  } catch (error) {
    console.error("Gemini summary generation error:", error);

    return {
      full: "⚠️ Error generating summary.",
      bullets: ["Summary generation failed."],
      insights: ["Error during AI generation."],
      tldr: "Summary failed.",
    };
  }
}
