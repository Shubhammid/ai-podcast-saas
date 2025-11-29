import type { step as InngestStep } from "inngest";
import { googleAI } from "@/lib/gemini-client"; 
import { type SocialPosts, socialPostsSchema } from "@/schemas/ai-outputs";
import type { TranscriptWithExtras } from "@/types/assemblyai";

const SOCIAL_SYSTEM_PROMPT = `
You are a viral social media marketing expert who deeply understands each platform’s tone, style, and best-performing post formats.
Produce platform-optimized posts that maximize engagement.
ONLY return valid JSON.
`;

function buildSocialPrompt(transcript: TranscriptWithExtras): string {
  return `
Create platform-specific promotional posts for this podcast episode.

PODCAST SUMMARY:
${transcript.chapters?.[0]?.summary || transcript.text.substring(0, 500)}

KEY TOPICS DISCUSSED:
${
  transcript.chapters
    ?.slice(0, 5)
    .map((c, i) => `${i + 1}. ${c.headline}`)
    .join("\n") || "See transcript"
}

Create 6 posts:

1. TWITTER/X (≤ 280 chars)
2. LINKEDIN (1–2 paragraphs)
3. INSTAGRAM (caption, 2–4 emojis)
4. TIKTOK (short, Gen-Z tone)
5. YOUTUBE (2–3 paragraph description)
6. FACEBOOK (2–3 paragraphs)

Return JSON with keys:
twitter, linkedin, instagram, tiktok, youtube, facebook.
NO extra commentary. JSON ONLY.
`;
}

export async function generateSocialPosts(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<SocialPosts> {
  console.log("Generating social posts with Gemini");

  try {
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

    const response = await step.ai.wrap(
      "generate-social-posts-gemini",
      createGeminiCall,
      {
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: SOCIAL_SYSTEM_PROMPT },
          { role: "user", content: buildSocialPrompt(transcript) },
        ],
      }
    );

    const raw = response.content;

    const parsed = socialPostsSchema.parse(JSON.parse(raw));

    if (parsed.twitter.length > 280) {
      parsed.twitter = parsed.twitter.substring(0, 277) + "...";
    }

    return parsed;
  } catch (error) {
    console.error("Gemini social post error:", error);
    return {
      twitter: "⚠️ Error generating post.",
      linkedin: "⚠️ Error generating post.",
      instagram: "⚠️ Error generating post.",
      tiktok: "⚠️ Error generating post.",
      youtube: "⚠️ Error generating post.",
      facebook: "⚠️ Error generating post.",
    };
  }
}
