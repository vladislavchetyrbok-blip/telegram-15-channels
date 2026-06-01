const baseUrl = process.env.AUTOPUBLISH_BASE_URL || process.env.APP_URL || "http://localhost:3000";
const endpoint = `${baseUrl.replace(/\/$/, "")}/api/autopublish`;

async function main() {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "check_schedule" }),
  });
  const payload = await response.json();

  console.log(JSON.stringify(payload, null, 2));

  if (!response.ok || payload.ok === false) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Autopublish dry-run failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error(`Endpoint: ${endpoint}`);
  process.exitCode = 1;
});
