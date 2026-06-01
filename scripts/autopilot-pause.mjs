const baseUrl = process.env.AUTOPUBLISH_API_BASE || process.env.AUTOPUBLISH_BASE_URL || process.env.APP_URL || "http://localhost:3000";
const endpoint = `${baseUrl.replace(/\/$/, "")}/api/admin/autopilot/pause`;

async function main() {
  const response = await fetch(endpoint, { method: "POST" });
  const payload = await readJsonResponse(response);
  console.log(JSON.stringify(payload, null, 2));
  if (!response.ok || payload.ok === false) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Autopilot pause failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error(`Endpoint: ${endpoint}`);
  process.exitCode = 1;
});

async function readJsonResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON, got HTTP ${response.status} ${response.headers.get("content-type") || "unknown"}: ${text.slice(0, 160)}`);
  }
}
