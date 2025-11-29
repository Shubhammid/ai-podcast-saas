export type PlanName = "free" | "pro" | "ultra";

export interface PlanLimits {
  maxProjects: number | null; 
  maxFileSize: number; 
  maxDuration: number | null;
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxProjects: 3, 
    maxFileSize: 10 * 1024 * 1024, 
    maxDuration: 600, 
  },
  pro: {
    maxProjects: 30, 
    maxFileSize: 200 * 1024 * 1024, 
    maxDuration: 7200,
  },
  ultra: {
    maxProjects: null, 
    maxFileSize: 3 * 1024 * 1024 * 1024,
    maxDuration: null, 
  },
};

export const FEATURES = {
  SUMMARY: "summary",
  SOCIAL_POSTS: "social_posts",
  TITLES: "titles",
  HASHTAGS: "hashtags",
  YOUTUBE_TIMESTAMPS: "youtube_timestamps",
  KEY_MOMENTS: "key_moments",
  SPEAKER_DIARIZATION: "speaker_diarization",
} as const;

export type FeatureName = (typeof FEATURES)[keyof typeof FEATURES];


export const PLAN_FEATURES: Record<PlanName, FeatureName[]> = {
  free: [FEATURES.SUMMARY],
  pro: [
    FEATURES.SUMMARY,
    FEATURES.SOCIAL_POSTS,
    FEATURES.TITLES,
    FEATURES.HASHTAGS,
  ],
  ultra: [
    FEATURES.SUMMARY,
    FEATURES.SOCIAL_POSTS,
    FEATURES.TITLES,
    FEATURES.HASHTAGS,
    FEATURES.YOUTUBE_TIMESTAMPS,
    FEATURES.KEY_MOMENTS,
    FEATURES.SPEAKER_DIARIZATION,
  ],
};

export const PLAN_NAMES: Record<PlanName, string> = {
  free: "Free",
  pro: "Pro",
  ultra: "Ultra",
};

export const PLAN_PRICES: Record<PlanName, string> = {
  free: "$0",
  pro: "$29/month",
  ultra: "$69/month",
};

export const FEATURE_TO_JOB_MAP = {
  [FEATURES.SOCIAL_POSTS]: "socialPosts",
  [FEATURES.TITLES]: "titles",
  [FEATURES.HASHTAGS]: "hashtags",
  [FEATURES.KEY_MOMENTS]: "keyMoments",
  [FEATURES.YOUTUBE_TIMESTAMPS]: "youtubeTimestamps",
  [FEATURES.SUMMARY]: "summary",
} as const;

export type JobName =
  (typeof FEATURE_TO_JOB_MAP)[keyof typeof FEATURE_TO_JOB_MAP];
