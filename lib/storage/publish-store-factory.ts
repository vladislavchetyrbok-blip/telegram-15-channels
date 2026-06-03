import { JsonPublishStore } from "./json-publish-store";
import { PostgresPublishStore } from "./postgres-publish-store";
import type { PublishStore, PublishStoreMode } from "./types";

export function getPublishStore(mode = getConfiguredPublishStoreMode()): PublishStore {
  if (mode === "postgres") return new PostgresPublishStore();
  return new JsonPublishStore();
}

export function getConfiguredPublishStoreMode(): PublishStoreMode {
  return process.env.PUBLISH_DUE_STORE === "postgres" ? "postgres" : "json";
}

export function isPostgresPublishStoreReady() {
  return Boolean(process.env.DATABASE_URL);
}
