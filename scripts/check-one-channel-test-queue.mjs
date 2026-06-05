import { getOneChannelTestQueueReport } from "./lib/one-channel-test-queue.mjs";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--") && arg.includes("="))
    .map((arg) => {
      const [key, ...value] = arg.slice(2).split("=");
      return [key, value.join("=")];
    }),
);

const report = await getOneChannelTestQueueReport({
  channelId: args["channel-id"],
});

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
