export type ZodiacProfileSyncBackend = "none";

export type ZodiacProfileSyncFlags = {
  syncEnabled: false;
  backend: ZodiacProfileSyncBackend;
  readEnabled: false;
  writeEnabled: false;
};

export const ZODIAC_PROFILE_SYNC_DEFAULT_FLAGS: ZodiacProfileSyncFlags = {
  syncEnabled: false,
  backend: "none",
  readEnabled: false,
  writeEnabled: false,
};
