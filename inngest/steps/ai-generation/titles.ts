// import type { step as InngestStep } from "inngest";
// import { googleAI } from "@/lib/gemini-client";
// import { type Summary, summarySchema } from "@/schemas/ai-outputs";
// import type { TranscriptWithExtras } from "@/types/assemblyai";

// const SUMMARY_SYSTEM_PROMPT = `
// You are an expert podcast content analyst and marketing strategist.
// Your summaries are engaging, insightful, structured, and highlight the most valuable takeaways.
// Always return valid JSON only.
// `;

// function buildSummaryPrompt(transcript: TranscriptWithExtras): string {
//   return `
// Analyze this podcast transcript and create a structured summary package.

// TRANSCRIPT (first 3000 chars):
// ${transcript.text.substring(0, 3000)}...

// ${
//   transcript.chapters.length > 0
//     ? `AUTO-DETECTED CHAPTERS:
// ${transcript.chapters
//   .map((ch, idx) => `${idx + 1}. ${ch.headline} - ${ch.summary}`)
//   .join("\n")}`
//     : ""
// }

// Create a summary with:

// 1. FULL OVERVIEW (200–300 words)
// 2. KEY BULLET POINTS (5–7 items)
// 3. ACTIONABLE INSIGHTS (3–5 items)
// 4. TL;DR (one compelling sentence)

// Return JSON matching the schema:
// {
//   "full": string,
//   "bullets": string[],
//   "insights": string[],
//   "tldr": string
// }
// `;
// }

// export async function generateTitles(
//   step: typeof InngestStep,
//   transcript: TranscriptWithExtras
// ): Promise<Summary> {
//   console.log("Generating summary with Gemini");

//   try {
//     const geminiCall = async (args: any) => {
//       const model = googleAI.getGenerativeModel({
//         model: args.model,
//         generationConfig: {
//           responseMimeType: "application/json",
//         },
//       });

//       const prompt = args.messages
//         .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
//         .join("\n\n");

//       const result = await model.generateContent(prompt);
//       return { content: result.response.text() };
//     };

//     const response = await step.ai.wrap(
//       "generate-summary-gemini",
//       geminiCall,
//       {
//         model: "gemini-2.0-flash",
//         messages: [
//           { role: "system", content: SUMMARY_SYSTEM_PROMPT },
//           { role: "user", content: buildSummaryPrompt(transcript) },
//         ],
//       }
//     );

//     const parsed = summarySchema.parse(JSON.parse(response.content));
//     return parsed;
//   } catch (error) {
//     console.error("Gemini summary generation error:", error);

//     return {
//       full: "⚠️ Error generating summary.",
//       bullets: ["Summary generation failed."],
//       insights: ["AI generation error."],
//       tldr: "Summary failed.",
//     };
//   }
// }

import type { step as InngestStep } from "inngest";
import { googleAI } from "@/lib/gemini-client";
import { titlesSchema, type Titles } from "@/schemas/ai-outputs";
import type { TranscriptWithExtras } from "@/types/assemblyai";

const TITLES_SYSTEM_PROMPT = `
You are an expert content strategist for podcasts and video creators.
You generate catchy titles, SEO keywords, and engaging short-form titles.
Always return valid JSON ONLY.
`;

function buildTitlesPrompt(transcript: TranscriptWithExtras): string {
  return `
Generate titles + SEO pack from this podcast transcript.

TRANSCRIPT (first 3000 chars):
${transcript.text.substring(0, 3000)}...

Return JSON in this structure:

{
  "youtubeShort": string[],   // 5–8 viral YouTube Shorts titles (max 50 chars)
  "youtubeLong": string[],    // 5–8 optimized long-form YouTube video titles
  "podcastTitles": string[],  // 5–8 podcast episode titles
  "seoKeywords": string[]     // 10–15 SEO keywords
}
`;
}

export async function generateTitles(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Titles> {
  console.log("Generating titles with Gemini");

  try {
    const geminiCall = async (args: any) => {
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

    const response = await step.ai.wrap(
      "generate-titles-gemini",
      geminiCall,
      {
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: TITLES_SYSTEM_PROMPT },
          { role: "user", content: buildTitlesPrompt(transcript) },
        ],
      }
    );

    const parsed = titlesSchema.parse(JSON.parse(response.content));
    return parsed;
  } catch (error) {
    console.error("Gemini titles generation error:", error);

    return {
      youtubeShort: ["AI Error: Titles unavailable"],
      youtubeLong: ["AI Error: Titles unavailable"],
      podcastTitles: ["AI Error: Titles unavailable"],
      seoKeywords: ["ai-error"],
    };
  }
}
