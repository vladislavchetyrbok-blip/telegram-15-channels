const baseUrl = process.env.AUTOPUBLISH_BASE_URL || process.env.APP_URL || "http://localhost:3000";

async function main() {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/content-calendar/audit`;
  const response = await fetch(endpoint, { method: "GET" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${endpoint}`);
  }

  const payload = await response.json();
  console.log(JSON.stringify(payload, null, 2));

  if (!payload.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Content calendar audit failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
