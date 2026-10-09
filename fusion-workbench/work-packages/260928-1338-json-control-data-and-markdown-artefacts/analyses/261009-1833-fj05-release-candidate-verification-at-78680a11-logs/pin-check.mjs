// Usage: node pin-check.mjs <repo> <commit> <pin.json> <prefix> <label>
// Hashes every pinned entry against `git show <commit>:<prefix><path>`.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const [repo, commit, pinPath, prefix, label] = process.argv.slice(2);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
const entries = Object.entries(pin.files);
let same = 0;
const diffs = [];
for (const [path, want] of entries) {
  let got;
  try {
    const buf = execFileSync("git", ["-C", repo, "show", `${commit}:${prefix}${path}`], { maxBuffer: 1 << 28 });
    got = createHash("sha256").update(buf).digest("hex");
  } catch {
    got = "MISSING";
  }
  if (got === want) same++;
  else diffs.push({ path, pinned: want, at_commit: got });
}
console.log(`pin=${label}`);
console.log(`pin_file=${pinPath}`);
console.log(`pin_commit=${pin.commit}`);
if (pin.bundle_digest) console.log(`pin_bundle_digest=${pin.bundle_digest}`);
console.log(`checked_against=${commit}`);
console.log(`prefix=${prefix || "(none)"}`);
console.log(`entries=${entries.length} equal=${same} differ=${diffs.length}`);
for (const d of diffs) console.log(`DIFF ${d.path} pinned=${d.pinned} at_commit=${d.at_commit}`);
