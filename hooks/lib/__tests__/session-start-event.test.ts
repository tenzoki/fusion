/**
 * The hook-written `session_start` row (`hooks/lib/orchestrator-events.ts`).
 *
 * These cases drive the emission directly rather than through a spawned hook,
 * for one reason: the plan's own end-to-end verification of this row needs
 * `fusion --update` and a session restart and therefore cannot run in the
 * session that writes the code. What CAN be settled here is the row's contract
 * — the six fields, the once-per-session key, and the absent-rather-than-empty
 * rule — and that is what each case asserts, on the parsed JSON rather than on
 * a rendered string.
 *
 * Identity is supplied through `FUSION_PERSON`/`FUSION_CHECKOUT`, which is the
 * module's own env-first path and not a stub of it: from a source-run vitest the
 * relative fallback to `bin/fusion-identity` resolves outside the plugin, so the
 * env is the only route that reaches this code the way a real session does.
 */

import { describe, it, expect, afterAll, beforeEach } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  SESSION_START_WRITER,
  emitSessionStartEvent,
  sessionStartAlreadyWritten,
} from "../orchestrator-events.js";

const LOG = ["fusion-workbench", "orchestrator-events.jsonl"];
const SID = "b47820a4-265b-4b35-8f7d-cf42c2cebf51";
const PERSON = "Kai Stalmann <ks@qantr.com>";
const CHECKOUT = "5e8248d7";

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** A throwaway project root with a workbench and no event log yet. */
function project(): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-session-start-"));
  tmpRoots.push(dir);
  mkdirSync(join(dir, "fusion-workbench"));
  writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
  return dir;
}

/** Every row in the project's log, parsed. */
function rows(root: string): Record<string, unknown>[] {
  let text: string;
  try {
    text = readFileSync(join(root, ...LOG), "utf-8");
  } catch {
    return [];
  }
  return text
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as Record<string, unknown>);
}

const FACTS = { gitHeadAtStart: "08e81db3c0ffee0000000000000000000000beef", domain: "code" };

beforeEach(() => {
  process.env.FUSION_PERSON = PERSON;
  process.env.FUSION_CHECKOUT = CHECKOUT;
});

describe("the SessionStart hook's session_start row", () => {
  it("carries all six fields, and a writer naming the hook", () => {
    const root = project();
    const written = emitSessionStartEvent(root, { session_id: SID }, () => FACTS);

    expect(written).not.toBeNull();
    expect(rows(root)).toHaveLength(1);
    expect(rows(root)[0]).toMatchObject({
      event: "session_start",
      session_id: SID,
      person: PERSON,
      checkout: CHECKOUT,
      git_head_at_start: FACTS.gitHeadAtStart,
      domain: FACTS.domain,
      writer: SESSION_START_WRITER,
    });
  });

  it("writes no second row for a second SessionStart in the same session", () => {
    const root = project();
    expect(emitSessionStartEvent(root, { session_id: SID }, () => FACTS)).not.toBeNull();
    expect(sessionStartAlreadyWritten(root, SID)).toBe(true);

    const second = emitSessionStartEvent(root, { session_id: SID }, () => FACTS);
    expect(second, "a repeat SessionStart wrote a second row").toBeNull();
    expect(rows(root)).toHaveLength(1);
  });

  it("does not spawn the fact resolution for a row it will not write", () => {
    const root = project();
    let resolutions = 0;
    const facts = () => {
      resolutions++;
      return FACTS;
    };
    emitSessionStartEvent(root, { session_id: SID }, facts);
    emitSessionStartEvent(root, { session_id: SID }, facts);
    expect(resolutions, "the duplicate call still paid for its subprocesses").toBe(1);
  });

  it("writes a different session's row into the same log", () => {
    const root = project();
    emitSessionStartEvent(root, { session_id: SID }, () => FACTS);
    emitSessionStartEvent(root, { session_id: "other-session" }, () => FACTS);
    expect(rows(root).map((r) => r.session_id)).toEqual([SID, "other-session"]);
  });

  it("is not suppressed by the model-written row for the same session", () => {
    const root = project();
    // What the orchestrator writes today: same event, same id, no `writer`.
    writeFileSync(
      join(root, ...LOG),
      JSON.stringify({ ts: "2026-09-09T21:03:54", event: "session_start", session_id: SID }) + "\n",
    );
    expect(emitSessionStartEvent(root, { session_id: SID }, () => FACTS)).not.toBeNull();
    expect(rows(root)).toHaveLength(2);
  });

  it("writes nothing at all when the payload carries no session identifier", () => {
    const root = project();
    for (const input of [{}, { session_id: "" }, { session_id: 7 }]) {
      expect(emitSessionStartEvent(root, input, () => FACTS)).toBeNull();
    }
    expect(rows(root)).toEqual([]);
  });

  it("leaves an unresolved field ABSENT rather than empty", () => {
    const root = project();
    delete process.env.FUSION_PERSON;
    delete process.env.FUSION_CHECKOUT;

    emitSessionStartEvent(root, { session_id: SID }, () => ({}));
    const row = rows(root)[0];

    for (const key of ["git_head_at_start", "domain", "person", "checkout"]) {
      expect(Object.keys(row), `${key} was written as an empty value`).not.toContain(key);
    }
    // The identifier is the one field that is never absent: it is the dedup key,
    // and a row without it could not be told from the next SessionStart's.
    expect(row.session_id).toBe(SID);
  });
});
