export interface TelegramRealTestState {
  event: "singleRealTestSent";
  channelId: "ai-tech";
  channelTitle: string;
  telegramChatId: string;
  messagesSent: 1;
  telegramSent: true;
  massBroadcast: false;
  repeatLock: true;
  realSendsTotal: 1;
  lastRealTestSentAt: string;
  productionBroadcast: "disabled";
  dryRunRestored: true;
}

const postTestHardLock: TelegramRealTestState = {
  event: "singleRealTestSent",
  channelId: "ai-tech",
  channelTitle: "AI и технологии",
  telegramChatId: "-1003504277183",
  messagesSent: 1,
  telegramSent: true,
  massBroadcast: false,
  repeatLock: true,
  realSendsTotal: 1,
  lastRealTestSentAt: "2026-05-22T18:17:12.5962185+03:00",
  productionBroadcast: "disabled",
  dryRunRestored: true,
};

export function getTelegramRealTestState() {
  return postTestHardLock;
}

export function listTelegramRealTestLogs() {
  return [
    {
      event: postTestHardLock.event,
      channelId: postTestHardLock.channelId,
      channelTitle: postTestHardLock.channelTitle,
      telegramChatId: postTestHardLock.telegramChatId,
      messagesSent: postTestHardLock.messagesSent,
      telegramSent: postTestHardLock.telegramSent,
      massBroadcast: postTestHardLock.massBroadcast,
      timestamp: postTestHardLock.lastRealTestSentAt,
    },
  ];
}
