import { JsonPublishStore } from "./json-publish-store";
import { PostgresPublishStore } from "./postgres-publish-store";
import type { PublishStore, PublishStoreMode } from "./types";

export function getPublishStore(mode = getConfiguredPublishStoreMode()): PublishStore {
  if (mode === "postgres") return new PostgresPublishStore();
  return new JsonPublishStore();
}

export function getConfiguredPublishStoreMode(): PublishStoreMode {
  const configured = process.env.PUBLISH_DUE_STORE;
  if (configured === "postgres") return "postgres";
  return "json";
}

export function isPostgresPublishStoreReady() {
  return Boolean(process.env.DATABASE_URL);
}

export { JsonPublishStore } from "./json-publish-store";
export { PostgresPublishStore } from "./postgres-publish-store";
export type {
  ChannelRecord,
  PostRecord,
  PublicationLogRecord,
  PublicationLogStatus,
  PublishStore,
  PublishStoreMode,
  SchedulerRunRecord,
  SchedulerRunResult,
} from "./types";
