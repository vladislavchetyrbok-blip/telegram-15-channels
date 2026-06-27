import { execFileSync } from "node:child_process";

function splitNames(output) {
  return output.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

export function gitChangedNames(paths, options = {}) {
  return gitChangedScope(paths, options).changed;
}

export function gitChangedScope(paths, { includeUntracked = true } = {}) {
  try {
    const pathArgs = ["--", ...paths];
    const rawTracked = splitNames(git(["diff", "--name-only", "HEAD", ...pathArgs]));
    const realTracked = splitNames(git(["diff", "--name-only", "--ignore-space-at-eol", "HEAD", ...pathArgs]));
    const realSet = new Set(realTracked);
    const eolOnly = rawTracked.filter((file) => !realSet.has(file));
    const untracked = includeUntracked ? splitNames(git(["ls-files", "--others", "--exclude-standard", ...pathArgs])) : [];

    return {
      changed: [...realTracked, ...untracked],
      real: realTracked,
      untracked,
      eolOnly,
      raw: rawTracked,
      failed: false,
    };
  } catch {
    return {
      changed: ["__git_diff_failed__"],
      real: ["__git_diff_failed__"],
      untracked: [],
      eolOnly: [],
      raw: ["__git_diff_failed__"],
      failed: true,
    };
  }
}
