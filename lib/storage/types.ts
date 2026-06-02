export type PublishStoreMode = "json" | "postgres";
export type PostStatus = "draft" | "scheduled" | "approved" | "ready_to_publish" | "published" | "failed" | "skipped" | string;
export type PublicationLogStatus = "success" | "skipped" | "failed";

export interface ChannelRecord {
  id: string;
  title: string | null;
  telegramChatId: string | null;
  slug: string | null;
  language: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PostRecord {
  id: string;
  postId: string;
  channelId: string;
  channelName?: string | null;
  title: string | null;
  text: string | null;
  telegramCaption?: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  telegramImagePath?: string | null;
  status: PostStatus;
  publishAt: string | null;
  telegramMessageId: number | null;
  telegramMessageLink: string | null;
  errorMessage: string | null;
  publishResult?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw?: Record<string, unknown>;
}

export interface PublicationLogRecord {
  id?: string;
  runId: string | null;
  source: "local" | "github" | "manual" | "api" | string | null;
  channelId: string | null;
  postId: string | null;
  status: PublicationLogStatus;
  message: string | null;
  telegramMessageId: number | null;
  telegramMessageLink: string | null;
  dryRun: boolean | null;
  createdAt?: string;
}

export interface SchedulerRunRecord {
  id: string;
  source: string | null;
  storeMode: PublishStoreMode | string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  message: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface SchedulerRunResult {
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  message: string | null;
}

export interface PublishStore {
  mode: PublishStoreMode;
  getDuePosts(now: Date): Promise<PostRecord[]>;
  markPostPublished(postId: string, telegramMessageId: number, telegramMessageLink?: string | null): Promise<void>;
  markPostFailed(postId: string, error: string): Promise<void>;
  appendPublicationLog(log: PublicationLogRecord): Promise<PublicationLogRecord>;
  getPublicationLogs(limit: number): Promise<PublicationLogRecord[]>;
  getSchedulerStatus(): Promise<SchedulerRunRecord | null>;
  createSchedulerRun(data: SchedulerRunRecord): Promise<SchedulerRunRecord>;
  finishSchedulerRun(runId: string, result: SchedulerRunResult): Promise<void>;
}
