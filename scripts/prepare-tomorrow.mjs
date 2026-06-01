const apiBase = process.env.AUTOPUBLISH_API_BASE || "http://localhost:3000";

try {
  const response = await fetch(`${apiBase}/api/autopublish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "prepare_tomorrow" }),
  });
  const payload = await response.json().catch(() => null);

  console.log(JSON.stringify({ status: response.status, ok: response.ok, payload }, null, 2));
  process.exit(response.ok ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : "prepare tomorrow failed");
  process.exit(1);
}
