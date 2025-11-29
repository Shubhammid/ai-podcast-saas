import type { step as InngestStep } from "inngest";
import { geminiJson } from "@/lib/gemini-client";
import {
  type Hashtags,
  hashtagsSchema
} from "@/schemas/ai-outputs";
import type { TranscriptWithExtras } from "@/types/assemblyai";

const HASHTAGS_SYSTEM_PROMPT =
  "You are a social media growth expert who understands platform algorithms and trending hashtag strategies. You produce platform-optimized hashtag sets that maximize reach, discovery, and engagement. Always return valid JSON.";

function buildHashtagsPrompt(transcript: TranscriptWithExtras): string {
  return `Create platform-optimized hashtag strategies for this podcast episode.

TOPICS COVERED:
${
    transcript.chapters?.length
      ? transcript.chapters
          .map((ch, idx) => `${idx + 1}. ${ch.headline}`)
          .join("\n")
      : "General discussion"
  }

Generate hashtags following each platform’s best practices:

1. **YOUTUBE** — exactly 5 hashtags  
   - Broad reach  
   - Mix of general + niche  
   - Discovery-focused  

2. **INSTAGRAM** — 6–8 hashtags  
   - Mix of popular + niche  
   - Story-friendly  
   - Community-relevant  

3. **TIKTOK** — 5–6 hashtags  
   - Trending tags  
   - FYP-optimized  
   - Gen Z friendly  

4. **LINKEDIN** — exactly 5 hashtags  
   - Professional  
   - Industry-specific  
   - B2B focused  

5. **TWITTER** — exactly 5 hashtags  
   - Trending topics  
   - Short & specific  
   - Mix of broad + niche  

RULES:
- Every hashtag MUST start with "#"
- All hashtags must be relevant to the discussion
- Return ONLY JSON matching the schema
- Do NOT include explanations or extra text

Return JSON in this structure:
{
  "youtube": string[],
  "instagram": string[],
  "tiktok": string[],
  "linkedin": string[],
  "twitter": string[]
}`;
}

export async function generateHashtags(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Hashtags> {
  console.log("🚀 Generating hashtags with Gemini…");

  try {
    const json = await step.ai.wrap(
      "generate-hashtags-with-gemini",
      async () => {
        return await geminiJson(
          "gemini-2.0-flash",
          [
            { role: "system", content: HASHTAGS_SYSTEM_PROMPT },
            { role: "user", content: buildHashtagsPrompt(transcript) },
          ],
          hashtagsSchema 
        );
      }
    );

    return hashtagsSchema.parse(json);
  } catch (error) {
    console.error("❌ Gemini hashtag generation error:", error);

    return {
      youtube: ["#HashtagGenerationFailed"],
      instagram: ["#HashtagGenerationFailed"],
      tiktok: ["#HashtagGenerationFailed"],
      linkedin: ["#HashtagGenerationFailed"],
      twitter: ["#HashtagGenerationFailed"],
    };
  }
}
