/**
 * SessionStart hook — the mint announcement, put on a channel that reaches the
 * user.
 *
 * ## The fault this closes
 *
 * `bin/fusion-identity` announces on stderr that it has just minted
 * `fusion-workbench/.checkout-id`, which is how a checkout learns that
 * `git clean -xdf` swept its identifier and a replacement was written in its
 * place. The announcement fires only in the process that wins the noclobber
 * write, and in an ordinary session that process is the SessionStart identity
 * export in `hooks/hooks.json` — the first `fusion-identity` call of the
 * session, running before `/fusion:setup`. That clause captured stdout and sent
 * stderr to `/dev/null`, so the one run that ever mints was the one run whose
 * announcement nobody could hear (issue `260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md`).
 *
 * ## Why the redirect was not simply dropped
 *
 * Because dropping it delivers nothing. Measured against Claude Code 2.1.261,
 * a SessionStart hook command that exits 0 has its stderr recorded in the
 * transcript's `hook_success` attachment and rendered nowhere: the attachment
 * renderer returns null for that type, and the SessionStart-to-context mapping
 * takes `hook_additional_context` and a `hook_success` whose `content` is
 * non-empty, which for a stderr-only command is the empty string. Neither the
 * user nor the model receives it. Only a non-zero exit surfaces stderr, as a
 * hook warning, and a routine announcement is not worth failing a hook for.
 *
 * `systemMessage` is the channel that does reach the user: it becomes a
 * `hook_system_message` attachment, rendered as `<hook> says: <content>`. It is
 * the same channel `session-start.ts` uses for the subdirectory warning and the
 * static banner uses for "Fusion loaded", and it is why this file exists.
 *
 * ## Why the shell one-liner hands the work here
 *
 * A shell command CAN emit the envelope — the banner is a bare `printf` doing
 * exactly that. What it cannot do cheaply is emit it *correctly*: the message
 * carries a filesystem path, so it needs JSON escaping, and writing that
 * escaping into a JSON string literal inside `hooks.json` is where it would go
 * wrong. So the clause merges stderr into its existing capture (`2>&1`, safe
 * because the two `sed` extractions are anchored on `^PERSON=` / `^CHECKOUT=`
 * and the helper writes no such line to stderr) and pipes the capture here.
 * The selection rule below is then a testable statement in TypeScript rather
 * than an untested one in a JSON-escaped shell fragment.
 *
 * ## The selection rule
 *
 * Of the merged capture, keep only the helper's own `fusion-identity: ` lines,
 * then drop everything before the first `minted ` one. Two consequences, both
 * intended. Nothing is said unless this run minted, so the notice reports an
 * act and never a state — a second session in the same checkout is silent. And
 * the surviving lines are exactly `announce_mint`'s, never the person half's
 * reasons, because that function is the last thing the helper writes to stderr.
 *
 * The two prefixes are a coupling to the helper's wording, and it is a coupling
 * on purpose rather than an accident: `identity-mint-notice.test.ts` drives the
 * real helper through the real `hooks.json` command, so a reworded announcement
 * reddens the suite here instead of going quiet in production.
 *
 * The helper itself is untouched. Its exit codes, its stdout, the halt on exit
 * 1, mint-once and never-overwrite are what they were; this file only carries
 * what it already said to somewhere it can be heard.
 */

import { readFileSync } from "node:fs";
import { failOpen } from "./lib/fail-open.js";

/** Every line the helper writes to stderr carries this prefix. */
const PREFIX = "fusion-identity: ";
/** The first line `announce_mint()` writes, and the gate for saying anything. */
const MINT = "fusion-identity: minted ";

/**
 * The announcement inside a `bin/fusion-identity` run's merged output, or
 * `null` when that run did not mint.
 */
export function mintNotice(captured: string): string | null {
  const lines = captured.split("\n").filter((l) => l.startsWith(PREFIX));
  const first = lines.findIndex((l) => l.startsWith(MINT));
  return first === -1 ? null : lines.slice(first).join("\n");
}

function readStdin(): string {
  try {
    // fd 0 to the end. A hook's stdin is a pipe here, and an absent one reads
    // as empty rather than throwing, which is the same silence as "no mint".
    return readFileSync(0, "utf-8");
  } catch {
    return "";
  }
}

function main(): void {
  const notice = mintNotice(readStdin());

  if (notice === null) {
    // The quiet run's shape, as guard.ts and session-start.ts write it: valid
    // JSON, no fields, no banner.
    process.stdout.write("{}\n");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        systemMessage: notice,
      },
    }) + "\n",
  );
}

try {
  main();
} catch (error) {
  // Fail open, as every other hook does. A session must not be taken down
  // because an announcement could not be phrased.
  failOpen("identity-notice", error, () => process.stdout.write("{}\n"));
}
