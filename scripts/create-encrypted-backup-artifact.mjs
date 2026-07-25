import { createEncryptedBackupArtifact, writeArtifactOutputs } from "./lib/encrypted-backup-artifact.mjs";

try {
  const report = await createEncryptedBackupArtifact();
  writeArtifactOutputs(report);
  console.log(JSON.stringify(report, null, 2));
} catch {
  console.error(JSON.stringify({
    ok: false,
    status: "error",
    message: "Encrypted backup artifact creation failed. No raw backup was uploaded.",
    rawBackupUploaded: false,
    privateKeyPresentOnRunner: false,
    secretsIncluded: false,
  }, null, 2));
  process.exitCode = 1;
}
