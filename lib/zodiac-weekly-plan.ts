import { buildZodiacDailyPreview, type ZodiacPreviewPost } from "./zodiac-content-generator";

export interface ZodiacWeeklyPlanDay {
  date: string;
  dayIndex: number;
  posts: ZodiacPreviewPost[];
}

export interface ZodiacWeeklyPlan {
  startDate: string;
  days: ZodiacWeeklyPlanDay[];
  summary: {
    totalPosts: number;
    averageQualityScore: number;
    postsNeedingReview: number;
  };
}

export function generateZodiacWeeklyPlan(startDate: string, stylePresetId?: string): ZodiacWeeklyPlan {
  const start = new Date(startDate);
  const days: ZodiacWeeklyPlanDay[] = [];
  
  let totalScore = 0;
  let totalScoredPosts = 0;
  let postsNeedingReview = 0;
  let totalPosts = 0;

  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const dateStr = current.toISOString().slice(0, 10);
    
    const posts = buildZodiacDailyPreview({ date: dateStr, stylePresetId });
    days.push({ date: dateStr, dayIndex: i, posts });
    
    totalPosts += posts.length;
    for (const post of posts) {
      if (post.qualityScore !== undefined) {
        totalScore += post.qualityScore;
        totalScoredPosts++;
      }
      if (post.editorialStatus === "needs_review" || post.editorialStatus === "draft") {
        postsNeedingReview++;
      }
    }
  }

  const averageQualityScore = totalScoredPosts > 0 ? Math.round(totalScore / totalScoredPosts) : 0;

  return {
    startDate,
    days,
    summary: {
      totalPosts,
      averageQualityScore,
      postsNeedingReview,
    }
  };
}
