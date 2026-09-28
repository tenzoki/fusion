// ---------------------------------------------------------------------------
// Prior's FJ01 handback, counterchecked through the pinned bundle (FJ01b step 8).
//
// The Prior side ran its own transition, `claimed → paused`, against the
// recorded session's workbench and handed back five files under
// `tests/testdata/fusion-fj01/prior-handback/` at Prior commit `c512c4c`
// (`docs/design/fusion-fj01-prior-response.md` section 7). They sit here under
// `fixtures/prior-handback/`, byte-identical (`shasum -a 256`):
//
//   4f5897da396b43cfac70b7f79932cb291e1f9cd3b86c5ab1b688edf30893b8e7  package.json
//   13058c70ea4d3079a4b8d8e18414b068bf344459f032aa81ca5b9c98b5ccd6df  revision.txt
//   ad5d5380e9294e29dc64c217d74bebb8df3658fa666299e8ffb501aa52a83f19  show.response.json
//   f9c8e60e7509e2e83743d620a5bf0598a345e1fadabf72d26df516d8f749b44b  transition.request.json
//   dc180fce19562d281f43d73d4f39b3b9feed503554c6cab1eba1a5989c58f328  transition.response.json
//
// What is checked: the handback is internally consistent (the revision is the
// digest of the stored bytes, the transition response names it and the
// recorded `03-show` revision as its predecessor, the request names the record
// and `paused`), the stored record is readable here (strict reader, schema),
// and a `show` through `bin/fusion-record` over a fresh copy of the scratch
// workbench with only that record replaced answers exactly
// `show.response.json`. The handback files are read as data and asserted as
// such; nothing here writes them. The workbench copy is a temp directory, as
// in `round-trip-cli.test.ts`; `show` echoes no root, so no placeholder
// substitution is needed.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { strictParse } from "../strict-json.js";
import { validate } from "../validate.js";

const CODEC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const WRAPPER = resolve(CODEC_DIR, "../bin/fusion-record");
const FIXTURE = join(CODEC_DIR, "fixtures", "workbench");
const SESSION = join(CODEC_DIR, "fixtures", "protocol-session");
const HANDBACK = join(CODEC_DIR, "fixtures", "prior-handback");

const RECORD = "work-packages/260928-1200-parser-fix/package.json";
// The record's own `schema` field reads `fusion.package/v1`; the validator is
// keyed by the URN the schema file declares, as `fixtures/manifest.json` spells it.
const PACKAGE_SCHEMA = "urn:fusion:schema:fusion.package/v1";

const handback = (name: string): Buffer => readFileSync(join(HANDBACK, name));
const json = (bytes: Buffer): Record<string, unknown> => JSON.parse(bytes.toString("utf-8")) as Record<string, unknown>;

const packageBytes = handback("package.json");
const revisionOfPackage = `sha256:${createHash("sha256").update(packageBytes).digest("hex")}`;

let tmp: string;
let project: string;
let root: string;
let shown: { stdout: string; stderr: string; status: number | null };

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "codec-prior-handback-"));
  project = join(tmp, "project");
  root = join(project, "fusion-workbench");
  mkdirSync(project);
  cpSync(FIXTURE, root, { recursive: true });
  // The one change to the fresh copy: the record as Prior stored it.
  writeFileSync(join(root, RECORD), packageBytes);

  const { FUSION_WORKBENCH: _drop, ...env } = process.env;
  const request = JSON.stringify({ op: "show", workbench: root, record: { path: RECORD } }) + "\n";
  const r = spawnSync(WRAPPER, [], { input: request, cwd: project, encoding: "utf-8", env });
  shown = { stdout: r.stdout ?? "", stderr: r.stderr ?? "", status: r.status };
});

afterAll(() => {
  if (tmp !== undefined) rmSync(tmp, { recursive: true, force: true });
});

describe("the handback is internally consistent", () => {
  it("revision.txt is sha256: over the bytes of package.json", () => {
    expect(handback("revision.txt").toString("utf-8")).toBe(`${revisionOfPackage}\n`);
  });

  it("transition.response.json carries that revision, and 03-show's revision as previous_revision", () => {
    const previous = json(readFileSync(join(SESSION, "03-show.response.json")));
    const previousRevision = (previous.result as Record<string, unknown>).revision;
    expect(previousRevision).toMatch(/^sha256:[0-9a-f]{64}$/);

    const response = json(handback("transition.response.json"));
    expect(response.ok).toBe(true);
    expect(response.result).toMatchObject({ path: RECORD, from: "claimed", to: "paused", revision: revisionOfPackage, previous_revision: previousRevision });
    expect(response.revisions).toEqual({ [RECORD]: revisionOfPackage });
  });

  it("transition.request.json names the record, `to: paused` and 03-show's revision as expected_revision", () => {
    const request = json(handback("transition.request.json"));
    const previous = json(readFileSync(join(SESSION, "03-show.response.json")));
    expect(request).toMatchObject({ op: "transition", record: { path: RECORD }, to: "paused", expected_revision: (previous.result as Record<string, unknown>).revision });
    expect(request.operation_id).toBe((json(handback("transition.response.json")).result as Record<string, unknown>).operation_id);
  });
});

describe("the stored record is readable here", () => {
  it("package.json passes the strict reader and validates against the package schema", () => {
    const parsed = strictParse(packageBytes);
    expect(parsed.ok, JSON.stringify(parsed)).toBe(true);
    if (!parsed.ok) return;
    expect((parsed.value as Record<string, unknown>).status).toBe("paused");
    expect((parsed.value as Record<string, unknown>).claim).toBeNull();
    const v = validate(PACKAGE_SCHEMA, parsed.value);
    expect(v, JSON.stringify(v, null, 2)).toEqual({ ok: true });
  });
});

describe("show through bin/fusion-record over the scratch workbench with only that record replaced", () => {
  it("exit 0, nothing on stderr, one line on stdout", () => {
    expect(shown.status, shown.stderr).toBe(0);
    expect(shown.stderr).toBe("");
    expect(shown.stdout.endsWith("\n")).toBe(true);
    expect(shown.stdout.trim().split("\n")).toHaveLength(1);
  });

  it("stdout equals show.response.json byte for byte", () => {
    const expected = handback("show.response.json").toString("utf-8");
    expect(expected).not.toContain(root);
    expect(shown.stdout).toBe(expected);
  });
});
