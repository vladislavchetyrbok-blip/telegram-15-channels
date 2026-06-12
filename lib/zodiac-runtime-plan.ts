export interface ZodiacRuntimePost {
  id: string;
  date: string;
  dayIndex: number;
  channelId: string;
  channelName: string;
  emoji: string;
  type: "general" | "sign";
  title: string;
  text: string;
  sections?: Array<{
    title: string;
    body: string;
  }>;
  visualPrompt: string;
  qualityScore?: number;
  editorialStatus?: string;
  publishReady: boolean;
  telegramUsername: string | null;
  telegramChannelId: string | null;
  mediaMode: "text_only" | "image_optional" | "image_required";
  imagePath: string | null;
  status: "preview";
}

export interface ZodiacRuntimePlan {
  planId: string;
  network: "zodiac";
  version: number;
  createdAt: string;
  startDate: string;
  daysCount: number;
  stylePresetId: string;
  posts: ZodiacRuntimePost[];
}

export function validateZodiacRuntimePlan(plan: unknown): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!plan || typeof plan !== "object") {
    return { ok: false, issues: ["Plan must be an object"] };
  }

  const p = plan as Partial<ZodiacRuntimePlan>;

  if (p.network !== "zodiac") issues.push("Plan network must be 'zodiac'");
  if (!p.planId) issues.push("Missing planId");
  if (!Array.isArray(p.posts)) {
    issues.push("Posts must be an array");
    return { ok: false, issues };
  }

  if (p.posts.length !== p.daysCount! * 13) {
    issues.push(`Expected ${p.daysCount! * 13} posts for ${p.daysCount} days, found ${p.posts.length}`);
  }

  p.posts.forEach((post, index) => {
    if (!post.id) issues.push(`Post at index ${index} missing id`);
    if (!post.channelId) issues.push(`Post ${post.id || index} missing channelId`);
    if (!post.title) issues.push(`Post ${post.id || index} missing title`);
    if (!post.text) issues.push(`Post ${post.id || index} missing text`);
    if (!post.visualPrompt) issues.push(`Post ${post.id || index} missing visualPrompt`);
    
    if (post.mediaMode !== "text_only" && post.mediaMode !== "image_optional" && post.mediaMode !== "image_required") {
      issues.push(`Post ${post.id || index} has invalid mediaMode: ${post.mediaMode}`);
    }

    if (post.mediaMode === "image_required" && !post.imagePath) {
      issues.push(`Post ${post.id || index} requires imagePath but it is missing`);
    }
  });

  return { ok: issues.length === 0, issues };
}
