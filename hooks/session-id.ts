/**
 * SessionStart hook — the Claude Code session identifier, put in front of the
 * model.
 *
 * ## What it answers
 *
 * "Which Claude Code process is this?" The orchestrator writes one line per
 * event into `fusion-workbench/orchestrator-events.jsonl` and names, on every
 * one of them, who wrote it and from which checkout. This supplies the third
 * name: which of that checkout's Claude Code sessions.
 *
 * That is NOT what `history_file` already says, and the difference is the whole
 * reason this hook exists. A fusion resume is a *new* Claude Code session that
 * finds `fusion-workbench/agentstate.yaml`, presents the saved state and
 * carries on with `session.history_file` held fixed (`agents/orchestrator.md`
 * `## Setup`, **What a resumed session inherits**) — so two processes share one
 * `history_file` and nothing in the log tells them apart. Claude Code's own
 * `--resume` and `--continue` are a different operation and preserve the
 * identifier; conflating the two is the defect recorded in
 * `260826-0805_*_the-resumption-measurement-answers-for-claude-codes-resume-and-the-plan-asked-about-fusions.md`.
 *
 * ## Channel: plain stdout, and it was MEASURED
 *
 * Plain stdout from a SessionStart hook is copied verbatim into the model's
 * context; `hookSpecificOutput.systemMessage` reaches the user and never the
 * model. Both halves were measured against Claude Code 2.1.245, in a throwaway
 * project outside every git tree, and read from the transcript's `hook_success`
 * attachments rather than from the model's testimony about its own context:
 * `260825-2214-can-a-hook-obtain-the-session-identifier.md`,
 * finding (b). The payload's `session_id` was measured non-empty in the same
 * report, finding (a).
 *
 * `hookSpecificOutput.additionalContext` was NOT measured on this event and is
 * NOT used here. It is the obvious clean-looking implementation and that is
 * precisely the trap: a delivery built on an unmeasured channel emits correctly,
 * logs as a successful hook and puts nothing in front of the model, with the
 * failure visible nowhere. `systemMessage` behaves exactly that way, which is
 * what the measurement found. Do not switch this to a channel nobody has
 * measured on SessionStart.
 *
 * ## Why a fourth command rather than a line inside session-start.ts
 *
 * One process writes one stdout, and the two hooks need opposite channels.
 * `session-start.ts` warns the USER about a working directory below the project
 * root and must therefore keep `systemMessage`; this value is for the MODEL and
 * must therefore be plain text. Emitting both from one process is not available:
 * a recognised JSON object routes `systemMessage` away and leaves `content`
 * empty, so whichever half went into the envelope would be the half that
 * disappeared. `session-start.ts`'s own header already argues that the banner
 * and the warning are two commands because they are two concerns; this is a
 * third concern and takes a third command, for the sharper reason that it is
 * also a different channel.
 *
 * ## Absent, never empty
 *
 * A payload with no usable `session_id` produces NO output at all. Anything
 * written here becomes model context, so a line reading "no session id" is a
 * sentence the orchestrator would have to be taught to ignore. Silence is the
 * absent-rather-than-empty rule spelled on this channel: no line, no key on the
 * event rows (`agents/orchestrator.md` Setup step 2).
 *
 * ## Why the line is English
 *
 * Every string fusion's hooks emit is English — see `session-start.ts`
 * `## Why the message is English` for the argument, which is not restated here.
 */

import { appendFileSync } from "node:fs";
import { failOpen } from "./lib/fail-open.js";

/** The usable identifier from the payload, or null. */
export function sessionIdValue(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const id = (payload as { session_id?: unknown }).session_id;
  if (typeof id !== "string" || id === "") return null;
  return id;
}

/** The one line this hook may print, or null when there is nothing to say. */
export function sessionIdLine(payload: unknown): string | null {
  const id = sessionIdValue(payload);
  return id === null ? null : `fusion: session_id=${id}`;
}

/**
 * Export the identifier into the session's environment (v10.8.0), so the
 * model's shell commands can put it on the event rows they still write —
 * `$FUSION_SESSION_ID` beside the `$FUSION_PERSON`/`$FUSION_CHECKOUT` pair the
 * SessionStart identity command exports. Charset-gated before it touches a
 * file that is later sourced: an identifier is a UUID, and anything outside
 * `[A-Za-z0-9_-]` is not one and is not written.
 */
export function exportSessionId(payload: unknown, envFile: string | undefined): void {
  if (!envFile) return;
  const id = sessionIdValue(payload);
  if (id === null || !/^[A-Za-z0-9_-]+$/.test(id)) return;
  appendFileSync(envFile, `export FUSION_SESSION_ID=${id}\n`, "utf-8");
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return;

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return; // Unparseable payload — nothing is known, so nothing is said.
  }

  const line = sessionIdLine(payload);
  if (line !== null) process.stdout.write(line + "\n");

  // After the stdout line, so an env-file failure can never cost the model
  // its copy of the identifier.
  try {
    exportSessionId(payload, process.env.CLAUDE_ENV_FILE);
  } catch {
    // Fail open: an identifier that reached the model but not the env file is
    // a degraded state the emit templates already tolerate (absent key).
  }
}

main().catch((err) => {
  // Fail open, as the other three hooks do. The verdict here is silence: this
  // hook has no envelope to emit and no state to append to, so there is nothing
  // to write before the marker. A session identifier the model never received is
  // a field absent from the log, which is a defined state; a SessionStart hook
  // that takes the session down with it is not.
  failOpen("session-id", err, () => {});
});
