const baseUrl = process.env.AUTOPUBLISH_BASE_URL || process.env.APP_URL || "http://localhost:3000";
const endpoint = `${baseUrl.replace(/\/$/, "")}/api/autopublish/status`;

async function main() {
  const response = await fetch(endpoint, { method: "GET" });
  const payload = await response.json();

  console.log(JSON.stringify(payload, null, 2));

  if (!response.ok || payload.ok === false) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Autopublish status request failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error(`Endpoint: ${endpoint}`);
  process.exitCode = 1;
});
