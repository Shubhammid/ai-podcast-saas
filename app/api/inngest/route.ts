import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { podcastProcessor } from "@/inngest/functions/podcast-processor";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, podcastProcessor],
});
