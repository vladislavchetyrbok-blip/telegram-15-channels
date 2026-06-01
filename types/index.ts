export type Language = "RU" | "UA" | "RU-UA";

export type ChannelGroup = "A" | "B";
export type TelegramAvatarStatus = "manual_configured" | "unknown" | "not_configured";

export type PostStatus =
  | "draft"
  | "ready_for_review"
  | "ready_to_publish"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "test_published"
  | "published"
  | "sent"
  | "failed"
  | "not_ready"
  | "invalid_text_encoding"
  | "failed_generation"
  | "blocked";

export type PostDraftStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "needs_revision"
  | "generated_failed"
  | "failed_generation"
  | "invalid_text_encoding"
  | "dry_run_sent"
  | "not_ready";

export type PostDraftLanguage = "ru" | "uk";
export type PostDraftValidationStatus = "passed" | "needs_revision" | "failed";
export type PostDraftSource = "manual_generation" | "first_batch_generation" | "content_plan" | "regeneration";
export type PublicationReadinessStatus = "not_ready" | "ready_for_test" | "test_published" | "ready_for_real_publish";
export type PostImageStatus = "OK" | "Missing" | "Path broken" | "Invalid";
export type PostQuality = "strong" | "medium" | "weak";
export type PostReadinessIssue =
  | "missing_title"
  | "missing_text"
  | "missing_channel"
  | "missing_post_image"
  | "broken_image_path"
  | "image_not_found"
  | "forbidden_currency_detected"
  | "mojibake_detected"
  | "test_publish_required"
  | "invalid_post_image_uses_channel_asset";
export type PostImageIssue = Extract<
  PostReadinessIssue,
  "missing_post_image" | "broken_image_path" | "image_not_found" | "invalid_post_image_uses_channel_asset"
> | null;

export interface PostDraft {
  id: string;
  channelId: string;
  channelTitle: string;
  channelName?: string;
  telegramChatId: string;
  title: string;
  content: string;
  imageUrl: string;
  telegramImagePath?: string;
  telegramImageStatus?: "OK" | "missing" | "unsupported_format" | "image_process_risk" | "broken_file" | "conversion_failed";
  imageCaption?: string;
  imageStatus?: PostImageStatus;
  imageIssue?: PostImageIssue;
  readinessReasons?: PostReadinessIssue[];
  readinessStatus?: PublicationReadinessStatus;
  textQuality?: PostQuality;
  imageQuality?: PostQuality;
  language: PostDraftLanguage;
  topic: string;
  status: PostDraftStatus;
  createdAt: string;
  updatedAt: string;
  scheduledFor: string | null;
  dryRun: true;
  telegramSent: false;
  aiProvider: "lmstudio";
  modelName: string;
  source?: PostDraftSource;
  validationStatus?: PostDraftValidationStatus;
  validationNotes?: string[];
  validationReasons?: string[];
  draftApprovedAt?: string | null;
  revisionRequestedAt?: string | null;
  rejectedAt?: string | null;
  variantOfDraftId?: string | null;
  regeneratedFromContent?: string | null;
}

export type DryRunPostAction =
  | "firstBatchGenerationStarted"
  | "firstBatchGenerationCompleted"
  | "draftGenerated"
  | "draftValidationFailed"
  | "draftCreated"
  | "draftApproved"
  | "draftRejected"
  | "draftNeedsRevision"
  | "draftVariantCreated"
  | "approved"
  | "rejected"
  | "scheduled"
  | "dryRunSent"
  | "regenerated";

export type DraftReviewAction =
  | "approved"
  | "rejected"
  | "needs_revision"
  | "regenerated"
  | "variant_created";

export interface DraftReviewHistory {
  id: string;
  draftId: string;
  action: DraftReviewAction;
  previousStatus: PostDraftStatus;
  nextStatus: PostDraftStatus;
  notes: string;
  createdAt: string;
  telegramSent: false;
}

export interface DryRunPostLog {
  postId: string;
  channelId: string;
  action: DryRunPostAction;
  status: PostDraftStatus;
  telegramSent: false;
  timestamp: string;
}

export type PublicationScheduleStatus = "scheduled" | "cancelled" | "dry_run_ready" | "dry_run_sent";

export interface PublicationScheduleItem {
  id: string;
  channelId: string;
  channelTitle: string;
  telegramChatId: string;
  draftId: string;
  contentPreview: string;
  scheduledFor: string;
  timezone: "Europe/Kyiv";
  status: PublicationScheduleStatus;
  dryRun: true;
  telegramSent: false;
  createdAt: string;
  updatedAt: string;
}

export type ScheduledPost = PublicationScheduleItem;

export type PublicationScheduleAction =
  | "scheduledPostCreated"
  | "scheduledPostCancelled"
  | "scheduledPostPreviewed"
  | "scheduledDryRunSent"
  | "scheduledCreated"
  | "scheduledCancelled";

export interface PublicationScheduleLog {
  scheduleId: string;
  draftId: string;
  channelId: string;
  action: PublicationScheduleAction;
  status: PublicationScheduleStatus;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export type ContentPlanPostType =
  | "useful_tip"
  | "list"
  | "news_style"
  | "product_pick"
  | "story"
  | "analysis"
  | "short_note";

export type ContentPlanPriority = "low" | "medium" | "high";
export type ContentPlanStatus = "idea" | "approved" | "rejected" | "converted_to_draft";

export interface ContentPlanItem {
  id: string;
  channelId: string;
  channelTitle: string;
  language: PostDraftLanguage;
  topic: string;
  angle: string;
  postType: ContentPlanPostType;
  priority: ContentPlanPriority;
  plannedFor: string;
  status: ContentPlanStatus;
  dryRun: true;
  createdAt: string;
  updatedAt: string;
}

export type ContentPlanAction =
  | "contentPlanGenerated"
  | "ideaApproved"
  | "ideaRejected"
  | "draftCreatedFromIdea";

export interface ContentPlanLog {
  itemId: string;
  channelId: string;
  action: ContentPlanAction;
  status: ContentPlanStatus;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export interface ChannelEditorialProfile {
  channelId: string;
  channelTitle: string;
  language: "ru" | "uk" | "ru-uk";
  tone: string;
  audience: string;
  contentPillars: string[];
  allowedPostTypes: ContentPlanPostType[];
  forbiddenTopics: string[];
  forbiddenWords: string[];
  styleRules: string[];
  formattingRules: string[];
  callToActionRules: string[];
  emojiPolicy: string;
  maxLength: number;
  examplesGood: string[];
  examplesBad: string[];
  primaryCurrency?: "UAH";
  allowedCurrencies?: Array<"UAH" | "USD" | "EUR">;
  forbiddenCurrencies?: string[];
  currencyPolicyEnabled?: boolean;
  dryRun: true;
}

export interface CurrencyPolicy {
  defaultCountry: "Ukraine";
  primaryCurrency: "UAH";
  primaryCurrencySymbol: string;
  allowedCurrencies: Array<"UAH" | "USD" | "EUR">;
  allowedSymbols: string[];
  forbiddenCurrencies: string[];
  forbiddenSymbols: string[];
  forbiddenWords: string[];
}

export interface CurrencyPolicyMatch {
  term: string;
  index: number;
  context: string;
}

export interface CurrencyPolicyValidationResult {
  ok: boolean;
  forbiddenCurrencyFound: boolean;
  matches: CurrencyPolicyMatch[];
  sanitizedSuggestion: string;
}

export interface VisualAssetPolicy {
  forbiddenCurrencySymbols: string[];
  forbiddenCurrencyCodes: string[];
  allowedCurrencySymbols: string[];
  allowedCurrencyCodes: Array<"UAH" | "USD" | "EUR">;
  forbiddenVisualThemes: string[];
  recommendedFinanceVisuals: string[];
  policyEnabled: true;
}

export type ChannelVisualAssetStatus = "missing" | "needs_review" | "approved" | "rejected";

export interface ChannelVisualAsset {
  id: string;
  channelId: string;
  channelTitle: string;
  logoPath: string;
  iconPath: string;
  previewPath: string;
  iconPrompt: string;
  visualStyle: string;
  forbiddenVisualElements: string[];
  approvedVisualElements: string[];
  status: ChannelVisualAssetStatus;
  currencyPolicyOk: boolean;
  notes: string;
  regeneratedAt?: string | null;
  rejectionReason?: string | null;
}

export type VisualAssetLogAction =
  | "visualPolicyViewed"
  | "assetAuditRun"
  | "assetApproved"
  | "assetRejected"
  | "assetNeedsReview"
  | "assetRegenerated";

export interface VisualAssetLog {
  action: VisualAssetLogAction;
  assetId?: string;
  channelId?: string;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export type ChannelLogoStatus = "missing" | "uploaded" | "needs_review" | "approved" | "rejected";

export interface ChannelLogo {
  id: string;
  channelId: string;
  channelTitle: string;
  fileName: string;
  filePath: string;
  publicUrl: string;
  status: ChannelLogoStatus;
  visualPolicyOk: boolean;
  notes: string;
  source?: "custom" | "generated";
  fileStatus?: "logo OK" | "missing" | "fallback";
  browserUrl?: string;
  fileSystemPath?: string;
  fileExists?: boolean;
  regeneratedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ChannelLogoLogAction =
  | "logoUploaded"
  | "logoApproved"
  | "logoRejected"
  | "logoNeedsReview"
  | "logoAuditRun"
  | "logoRegenerated";

export interface ChannelLogoLog {
  action: ChannelLogoLogAction;
  logoId?: string;
  channelId?: string;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export interface EditorialValidationResult {
  ok: boolean;
  reasons: string[];
  profile: ChannelEditorialProfile;
  telegramSent: false;
  mode: "dry-run";
}

export type EditorialLogAction =
  | "editorialProfileLoaded"
  | "postValidated"
  | "validationFailed"
  | "regeneratedByRules";

export interface EditorialLog {
  channelId: string;
  action: EditorialLogAction;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export interface NetworkAnalytics {
  channelsTotal: number;
  channelsConnected: number;
  draftsTotal: number;
  draftsPendingReview: number;
  draftsApproved: number;
  draftsRejected: number;
  scheduledTotal: number;
  dryRunSentTotal: number;
  realTelegramSentTotal: number;
  lastRealSendChannelTitle?: string | null;
  lastRealSendAt?: string | null;
  productionBroadcast?: "disabled";
  dryRunActive?: boolean;
  contentPlanItemsTotal: number;
  editorialProfilesTotal: number;
  logosUploaded: number;
  logosApproved: number;
  logosNeedReview: number;
  logosRejected: number;
  errorsTotal: number;
  lastGeneratedAt: string | null;
  lastDryRunAt: string | null;
  mode: "dry-run";
}

export interface ChannelAnalytics {
  channelId: string;
  channelTitle: string;
  language: "ru" | "uk" | "ru-uk";
  telegramChatId: string;
  botAdded: boolean;
  status: string;
  draftsTotal: number;
  approvedDrafts: number;
  scheduledPosts: number;
  dryRunSent: number;
  failedGenerations: number;
  contentIdeas: number;
  lastGeneratedAt: string | null;
  lastScheduledFor: string | null;
  qualityScoreMock: number;
  realTelegramSent: number;
}

export type NetworkLogAction =
  | "networkHealthChecked"
  | "analyticsViewed"
  | "channelAnalyticsLoaded"
  | "fullSystemCheck";

export interface NetworkLog {
  action: NetworkLogAction;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export interface NetworkHealth {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  telegram: {
    tokenPresent: boolean;
    dryRun: boolean;
    channelsTotal: number;
    channelsWithChatId: number;
    realSendingEnabled: boolean;
  };
  ai: {
    provider: "lmstudio";
    connected: boolean;
    model: string;
    models: string[];
    message: string;
  };
  content: {
    draftsTotal: number;
    scheduledTotal: number;
    contentPlanItemsTotal: number;
    editorialProfilesTotal: number;
  };
  safety: {
    telegramSentReal: number;
    sendMessageBlockedByDryRun: boolean;
  };
  warnings: string[];
  checkedAt: string;
}

export type TelegramSafetyMode = "dry-run" | "production_locked" | "production_ready";

export interface TelegramSafetyConfig {
  dryRun: boolean;
  realSendingEnabled: boolean;
  requireManualConfirm: boolean;
  allowedChannelIds: string[];
  blockedChannelIds: string[];
  maxMessagesPerRun: number;
  maxMessagesPerChannelPerDay: number;
  requireApprovedDraftOnly: boolean;
  requireScheduledOnly: boolean;
  requireTelegramChatId: boolean;
  requireBotToken: boolean;
  emergencyStop: boolean;
  lastSafetyCheckAt: string | null;
  mode: TelegramSafetyMode;
}

export interface TelegramSendSafetyPayload {
  channelId?: string;
  telegramChatId?: string;
  draftId?: string;
  draftStatus?: PostDraftStatus;
  messagesInRun?: number;
  messagesForChannelToday?: number;
  manualConfirmationToken?: string;
  manualSingleChannelTest?: boolean;
}

export interface TelegramSendSafetyResult {
  ok: boolean;
  canSendReal: boolean;
  mode: TelegramSafetyMode;
  dryRun: boolean;
  realSendingEnabled: boolean;
  telegramSent: false;
  reason: string;
  reasons: string[];
  checks: Array<{
    key: string;
    ok: boolean;
    message: string;
  }>;
  config: TelegramSafetyConfig;
}

export type TelegramSafetyLogAction =
  | "telegramSafetyChecked"
  | "telegramRealSendBlocked"
  | "emergencyStopMocked"
  | "sendAttemptBlockedByDryRun";

export interface TelegramSafetyLog {
  action: TelegramSafetyLogAction;
  channelId?: string;
  draftId?: string;
  reason: string;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export type ProductionSendRequestStatus =
  | "blocked_by_dry_run"
  | "waiting_confirmation"
  | "approved_for_real_send"
  | "rejected"
  | "sent_mock";

export interface ProductionSendRequest {
  id: string;
  draftId: string;
  channelId: string;
  channelTitle: string;
  telegramChatId: string;
  contentPreview: string;
  requestedAt: string;
  requestedBy: "local-user";
  confirmationPhrase: string;
  status: ProductionSendRequestStatus;
  dryRun: true;
  telegramSent: false;
  safetyChecks: TelegramSendSafetyResult["checks"];
  createdAt: string;
  updatedAt: string;
}

export type ProductionSendLogAction =
  | "productionStatusViewed"
  | "realSendPrepared"
  | "realSendBlockedByDryRun"
  | "realSendConfirmationRejected";

export interface ProductionSendLog {
  action: ProductionSendLogAction;
  requestId?: string;
  draftId?: string;
  channelId?: string;
  reason: string;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export interface SingleChannelTestConfig {
  enabled: boolean;
  dryRun: boolean;
  selectedChannelId: string;
  selectedTelegramChatId: string;
  selectedChannelTitle: string;
  maxMessagesPerTest: 1;
  requireManualConfirm: true;
  confirmationPhrase: "Я подтверждаю тестовую отправку в один канал";
  testMode: "locked" | "ready";
  lastTestAt: string | null;
  lastRealTestSentAt: string | null;
  defaultRealTestText: string;
  realTestLockedAfterSuccess: boolean;
  telegramSent: false;
}

export type SingleChannelTestLogAction =
  | "singleTestStatusViewed"
  | "singleTestPrepared"
  | "singleTestBlockedByDryRun"
  | "singleTestConfirmationRejected"
  | "singleRealTestSent";

export interface SingleChannelTestLog {
  action: SingleChannelTestLogAction;
  channelId?: string;
  draftId?: string;
  reason: string;
  channelTitle?: string;
  telegramChatId?: string;
  telegramSent: boolean;
  messagesSent?: number;
  massBroadcast?: false;
  mode: "dry-run";
  timestamp: string;
}

export type TelegramControlTestLogAction =
  | "controlTestViewed"
  | "controlTestValidated"
  | "controlTestDryRunSent"
  | "realSendBlockedByDryRun";

export interface TelegramControlTestLog {
  action: TelegramControlTestLogAction;
  channelId?: string;
  reason: string;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  language: Language;
  telegramUsername?: string;
  autoposting?: "on" | "paused" | "off";
  group: ChannelGroup;
  category: string;
  description: string;
  subscribers: number;
  active: boolean;
  postsToday: number;
  scheduledPosts: number;
  engagementRate: number;
  growthRate: number;
  tone: string;
  customLogoUrl?: string;
  customLogoFileName?: string;
  customLogoUploadedAt?: string;
  logoSource?: "custom" | "generated";
  telegramAvatarStatus?: TelegramAvatarStatus;
  visualProfile?: {
    stylePreset: string;
    palette: string;
    imageTone: string;
    forbiddenVisuals: string[];
    preferredElements: string[];
    headlineStyle: string;
    layout: string;
  };
}

export interface Post {
  id: string;
  channelId: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageCaption?: string;
  imageStatus?: PostImageStatus;
  imageIssue?: PostImageIssue;
  readinessReasons?: PostReadinessIssue[];
  readinessStatus?: PublicationReadinessStatus;
  textQuality?: PostQuality;
  imageQuality?: PostQuality;
  status: PostStatus;
  publishAt: string;
  author: string;
  aiGenerated: boolean;
  views: number;
}

export interface CalendarSlot {
  date: string;
  posts: Post[];
}
