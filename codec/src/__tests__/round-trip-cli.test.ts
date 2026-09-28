// ---------------------------------------------------------------------------
// The first record read and updated through `bin/fusion-record` (FJ01 step 8).
//
// Six exchanges, through the wrapper only (the wrapper is spawned, never
// `node` on the bundle), over a temp copy of the scratch workbench:
//
//   01 show        the open package: its control, revision and narrative hash
//   02 transition  to `claimed` with the shown revision, a claim, an actor, a
//                  reason and a fixed operation_id: lands, new revision
//   03 show        again: status `claimed`, the revision 02 returned
//   04 transition  again with 01's revision: conflict/revision-mismatch
//   05 transition  02 repeated, same operation_id and payload: the stored
//                  answer, byte-identical to 02's
//   06 validate    the whole workbench: ok, valid
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session/` as
// `0<n>-<op>.request.json` (the bytes written to the wrapper's stdin) and
// `0<n>-<op>.response.json` (the bytes read from its stdout), so the Prior
// side has the exact bytes to reproduce. The files are a GOLDEN: on an
// ordinary run the fresh exchange is compared with the recorded one, byte for
// byte, and a difference fails; `UPDATE_PROTOCOL_SESSION=1` rewrites them
// from the fresh exchange and then asserts the same. Nothing about the
// exchange depends on the clock or on a generated id: the claim's timestamp
// and the operation_id are fixed literals below, the revisions are hashes of
// deterministic bytes, so the files are stable across runs and machines.
//
// One substitution: the workbench is a temp directory, so its absolute path
// is recorded as the literal `<workbench>` in every request and response and
// put back at replay. The rule and the replay procedure are in the fixtures'
// own `README.md`, which is for the Prior side.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Response } from "../cli/protocol.js";

const CODEC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const WRAPPER = resolve(CODEC_DIR, "../bin/fusion-record");
const FIXTURE = join(CODEC_DIR, "fixtures", "workbench");
const SESSION = join(CODEC_DIR, "fixtures", "protocol-session");
const UPDATE = process.env.UPDATE_PROTOCOL_SESSION === "1";

const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const PLACEHOLDER = "<workbench>";
const OPERATION_ID = "7c1f3b2e-5a4d-4e8f-9b0c-1d2e3f4a5b6c";
const PERSON = "Kai Stalmann <ks@qantr.com>";
const ACTOR = { actor: "user", person: PERSON };
const CLAIM = { checkout_id: "a1b2c3d4", person: PERSON, claimed_at: "2026-09-28T17:30:00+02:00" };
const REASON = "FJ01: the first record claimed through bin/fusion-record";

interface Exchange {
  name: string;
  /** The request as sent, with the real workbench path. */
  request: Record<string, unknown>;
  /** Exactly what the wrapper wrote to stdout. */
  stdout: string;
  stderr: string;
  status: number | null;
}

let tmp: string;
/** The project directory the wrapper is run from; the workbench is `fusion-workbench/` under it. */
let project: string;
let root: string;
const exchanges: Exchange[] = [];

/** The temp path as it appears inside JSON text. */
const rootInJson = (): string => JSON.stringify(root).slice(1, -1);
const record = (text: string): string => text.split(rootInJson()).join(PLACEHOLDER);
const replay = (text: string): string => text.split(PLACEHOLDER).join(rootInJson());

const requestBytes = (request: Record<string, unknown>): string => JSON.stringify(request) + "\n";
const parse = (stdout: string): Response => JSON.parse(stdout) as Response;

function exchange(name: string, request: Record<string, unknown>): Exchange {
  const { FUSION_WORKBENCH: _drop, ...env } = process.env;
  const r = spawnSync(WRAPPER, [], { input: requestBytes(request), cwd: project, encoding: "utf-8", env });
  const e: Exchange = { name, request, stdout: r.stdout ?? "", stderr: r.stderr ?? "", status: r.status };
  exchanges.push(e);
  return e;
}

const result = (e: Exchange): Record<string, unknown> => {
  const response = parse(e.stdout);
  expect(response.ok, `${e.name}: ${e.stdout}`).toBe(true);
  if (!response.ok) throw new Error("unreachable");
  return response.result as Record<string, unknown>;
};

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "codec-round-trip-"));
  project = join(tmp, "project");
  root = join(project, "fusion-workbench");
  mkdirSync(project);
  cpSync(FIXTURE, root, { recursive: true });

  const shown = exchange("01-show", { op: "show", workbench: root, record: { path: OPEN } });
  const revision = result(shown).revision as string;
  const claim = {
    op: "transition",
    workbench: root,
    operation_id: OPERATION_ID,
    record: { path: OPEN },
    expected_revision: revision,
    actor: ACTOR,
    to: "claimed",
    reason: REASON,
    payload: { claim: CLAIM },
  };
  exchange("02-transition", claim);
  exchange("03-show", { op: "show", workbench: root, record: { path: OPEN } });
  exchange("04-transition", { ...claim, operation_id: "8d2f4c3f-6b5e-4f9a-8c1d-2e3f4a5b6c7d" });
  exchange("05-transition", claim);
  exchange("06-validate", { op: "validate", workbench: root });
});

afterAll(() => {
  if (tmp !== undefined) rmSync(tmp, { recursive: true, force: true });
});

const byName = (name: string): Exchange => {
  const e = exchanges.find((x) => x.name === name);
  if (e === undefined) throw new Error(`no exchange ${name}`);
  return e;
};

describe("the six exchanges through bin/fusion-record", () => {
  it("the wrapper exists and is executable", () => {
    expect(existsSync(WRAPPER), `${WRAPPER} is absent`).toBe(true);
  });

  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual(["01-show", "02-transition", "03-show", "04-transition", "05-transition", "06-validate"]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("01 show: the open package, its revision and narrative hash", () => {
    const r = result(byName("01-show"));
    expect(r.kind).toBe("package");
    expect((r.control as Record<string, unknown>).status).toBe("open");
    expect(r.revision).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect((r.narrative as Record<string, unknown>).sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("02 transition: open to claimed under the shown revision, a new revision returned", () => {
    const before = result(byName("01-show")).revision;
    const r = result(byName("02-transition"));
    expect(r).toMatchObject({ operation_id: OPERATION_ID, path: OPEN, from: "open", to: "claimed", previous_revision: before });
    expect(r.revision).not.toBe(before);
    expect(readFileSync(join(root, OPEN), "utf-8")).toContain('"status": "claimed"');
  });

  it("03 show: status claimed, the revision 02 returned, the claim as sent", () => {
    const r = result(byName("03-show"));
    expect((r.control as Record<string, unknown>).status).toBe("claimed");
    expect((r.control as Record<string, unknown>).claim).toEqual(CLAIM);
    expect(r.revision).toBe(result(byName("02-transition")).revision);
  });

  it("04 transition with 01's revision: conflict/revision-mismatch, the record untouched", () => {
    const stale = result(byName("01-show")).revision as string;
    const current = result(byName("02-transition")).revision as string;
    expect(parse(byName("04-transition").stdout)).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${current} expected ${stale}` } });
    expect(result(byName("03-show")).revision).toBe(current);
  });

  it("05 transition, 02 repeated with the same operation_id and payload: the stored answer, byte-identical", () => {
    expect(byName("05-transition").stdout).toBe(byName("02-transition").stdout);
  });

  it("06 validate the workbench: ok, valid, three pairs checked", () => {
    expect(result(byName("06-validate"))).toMatchObject({ checked: 3, valid: true, findings: [] });
  });
});

describe(`the recorded session under fixtures/protocol-session/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
  it("no recorded byte carries the temp path, and the placeholder round-trips", () => {
    for (const e of exchanges) {
      const req = record(requestBytes(e.request));
      const res = record(e.stdout);
      expect(req, e.name).not.toContain(root);
      expect(res, e.name).not.toContain(root);
      expect(replay(req), e.name).toBe(requestBytes(e.request));
      expect(replay(res), e.name).toBe(e.stdout);
    }
    // The placeholder is load-bearing in every request; in a response only
    // where the answer echoes the root (validate does, show and transition do not).
    expect(record(requestBytes(byName("01-show").request))).toContain(PLACEHOLDER);
    expect(record(byName("06-validate").stdout)).toContain(PLACEHOLDER);
  });

  for (const name of ["01-show", "02-transition", "03-show", "04-transition", "05-transition", "06-validate"]) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const e = byName(name);
      const requestFile = join(SESSION, `${name}.request.json`);
      const responseFile = join(SESSION, `${name}.response.json`);
      const freshRequest = record(requestBytes(e.request));
      const freshResponse = record(e.stdout);
      if (UPDATE) {
        mkdirSync(SESSION, { recursive: true });
        writeFileSync(requestFile, freshRequest);
        writeFileSync(responseFile, freshResponse);
      }
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`UPDATE_PROTOCOL_SESSION=1 npm test -- round-trip-cli\` in codec/ and commit fixtures/protocol-session/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with UPDATE_PROTOCOL_SESSION=1 and commit the files; the Prior side replays them.`).toBe(freshRequest);
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with UPDATE_PROTOCOL_SESSION=1 and commit the files; the Prior side replays them.`).toBe(freshResponse);
    });
  }

  it("the recorded set is exactly the six pairs and a README", () => {
    const files = readdirSync(SESSION).sort();
    const expected = ["README.md", ...["01-show", "02-transition", "03-show", "04-transition", "05-transition", "06-validate"].flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort();
    expect(files).toEqual(expected);
  });
});

describe("the wrapper's own two answers", () => {
  it("without a workbench in the request or the environment, the walk-up from the working directory supplies it", () => {
    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    const r = spawnSync(WRAPPER, [], { input: requestBytes({ op: "show", record: { path: OPEN } }), cwd: project, encoding: "utf-8", env });
    expect(r.status, r.stderr).toBe(0);
    const response = parse(r.stdout);
    expect(response.ok, r.stdout).toBe(true);
    if (!response.ok) return;
    expect((response.result as Record<string, unknown>).revision).toBe(result(byName("02-transition")).revision);
    // From a directory with no workbench above it, the bundle's own answer stands: unknown-scope, exit 0.
    const nowhere = spawnSync(WRAPPER, [], { input: requestBytes({ op: "inspect" }), cwd: tmp, encoding: "utf-8", env });
    expect(nowhere.status).toBe(0);
    expect(parse(nowhere.stdout)).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-unspecified" } });
  });

  it("a missing bundle is exit 3 with the reason on stderr and nothing on stdout", () => {
    const stray = join(tmp, "stray-install", "bin");
    mkdirSync(stray, { recursive: true });
    const copy = join(stray, "fusion-record");
    cpSync(WRAPPER, copy);
    chmodSync(copy, 0o755);
    const r = spawnSync(copy, [], { input: requestBytes({ op: "inspect", workbench: root }), encoding: "utf-8" });
    expect(r.status).toBe(3);
    expect(r.stdout).toBe("");
    expect(r.stderr).toMatch(/^fusion-record: .*codec\/dist\/fusion-record\.js is missing/);
  });
});
