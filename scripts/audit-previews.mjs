const baseUrl = process.env.AUTOPUBLISH_BASE_URL || process.env.APP_URL || "http://localhost:3000";
const channels = [
  "money-opportunities",
  "ai-tech",
  "ukraine-market",
  "mens-style",
  "home-tech",
  "fishing-rest",
  "dnipro-city",
  "auto-comfort",
  "business-ideas",
  "personal-progress",
  "dnipro-real-estate-ru",
  "dnipro-real-estate-ua",
  "commercial-real-estate",
  "land-houses",
  "real-estate-investments",
];

async function main() {
  const results = [];

  for (const channelId of channels) {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/autopublish/preview?channelId=${encodeURIComponent(channelId)}`;
    const response = await fetch(endpoint, { method: "GET" });
    const payload = await response.json();
    const preview = payload.preview || payload;
    const qualityIssues = preview.qualityIssues || payload.qualityIssues || [];
    const ready = Boolean(payload.ok && qualityIssues.length === 0 && preview.telegramImageStatus === "OK");

    results.push({
      channelId,
      ok: Boolean(payload.ok),
      ready,
      title: preview.title || null,
      textQuality: preview.textQuality || null,
      imageQuality: preview.imageQuality || null,
      telegramImageStatus: preview.telegramImageStatus || null,
      qualityIssues,
    });
  }

  const failed = results.filter((item) => !item.ok || !item.ready);
  console.log(JSON.stringify({ ok: failed.length === 0, total: results.length, failed: failed.length, results }, null, 2));

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Preview audit failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
