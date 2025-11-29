import type { step as InngestStep } from "inngest";
import { geminiJson } from "@/lib/gemini-client";
import { formatTimestamp } from "@/lib/format";
import type { TranscriptWithExtras } from "@/types/assemblyai";

type YouTubeTimestamp = {
  timestamp: string;
  description: string;
};

export const youtubeTimestampsSchema = {
  parse: (data: any) => data,
};

export async function generateYouTubeTimestamps(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<YouTubeTimestamp[]> {
  console.log("Generating YouTube timestamps with Gemini");

  const chapters = transcript.chapters || [];
  if (!chapters.length) {
    throw new Error("No chapters available from AssemblyAI.");
  }

  const chaptersToUse = chapters.slice(0, 100);

  const chapterData = chaptersToUse.map((chapter, idx) => ({
    index: idx,
    timestamp: Math.floor(chapter.start / 1000),
    headline: chapter.headline,
    summary: chapter.summary,
  }));

  const prompt = `You are a YouTube content optimization expert. Create SHORT CHAPTER TITLES for a video.

CRITICAL INSTRUCTIONS:
- Do NOT copy the transcript text
- Do NOT write full sentences
- Create 3–6 word TITLES only

CHAPTERS:
${chapterData
    .map(
      (ch, idx) =>
        `Chapter ${idx}: [${ch.timestamp}s]\nContext: ${ch.headline}\nSummary: ${ch.summary}`
    )
    .join("\n\n")}

Return ONLY valid JSON:
{
  "titles": [
    { "index": 0, "title": "Your Title" }
  ]
}`;

  const json = await step.ai.wrap(
    "generate-youtube-titles-gemini",
    async () =>
      geminiJson("gemini-2.0-flash", [
        { role: "system", content: "You are a YouTube expert creating short chapter titles." },
        { role: "user", content: prompt },
      ], youtubeTimestampsSchema)
  );

  const aiTitles: { index: number; title: string }[] = json.titles ?? [];

  const aiTimestamps = chapterData.map((chapter) => {
    const aiTitle = aiTitles.find((t) => t.index === chapter.index);
    return {
      timestamp: chapter.timestamp,
      description: aiTitle?.title || chapter.headline,
    };
  });

  return aiTimestamps.map((item) => ({
    timestamp: formatTimestamp(item.timestamp, { padHours: false }),
    description: item.description,
  }));
}
