export interface TelegramDryRunGenerationEvent {
  channelId: string;
  channelTitle: string;
  telegramChatId: string;
  generatedAt: string;
  aiProvider: "lmstudio";
  telegramSent: false;
  mode: "dry-run";
}

interface TelegramDryRunEventStore {
  events: TelegramDryRunGenerationEvent[];
}

const globalForDryRunEvents = globalThis as typeof globalThis & {
  __telegramDryRunGenerationEvents?: TelegramDryRunEventStore;
};

const store =
  globalForDryRunEvents.__telegramDryRunGenerationEvents ??
  (globalForDryRunEvents.__telegramDryRunGenerationEvents = {
    events: [],
  });

export function addTelegramDryRunGenerationEvent(event: TelegramDryRunGenerationEvent) {
  store.events.unshift(event);
}

export function listTelegramDryRunGenerationEvents() {
  return [...store.events].sort((left, right) => right.generatedAt.localeCompare(left.generatedAt));
}
