// ---------------------------------------------------------------------------
// The manifest-driven fixture suite.
//
// `codec/fixtures/manifest.json` is the language-neutral index of every
// fixture; Prior's Go side reads the same file and asserts the same outcomes.
// This suite is the TypeScript side of that sentence. Every outcome below is
// COMPUTED by the strict reader and the validator and then compared with what
// the manifest says; nothing is read out of the manifest into the expectation.
//
// The manifest is written by another step. Until it exists the suite says so
// and passes, and the coverage test still runs: a fixture file without a
// manifest is an unlisted fixture.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRICT_REASONS, strictParse, type StrictReason } from "../strict-json.js";
import { loadSchemas, validate } from "../validate.js";

const FIXTURES_DIR = fileURLToPath(new URL("../../fixtures/", import.meta.url));
const MANIFEST_FILE = "manifest.json";
const MANIFEST_SCHEMA_ID = "fusion.fixture-manifest/v1";
const BYTES_SCHEMA = "bytes";

interface Entry {
  path: string;
  schema: string;
  expect: "valid" | "invalid";
  error_class?: "schema-invalid" | "unsupported-format";
  reason?: string;
  note?: string;
}

type Outcome =
  | { ok: true }
  | { ok: false; class: "schema-invalid" | "unsupported-format"; strictReason?: StrictReason; detail: string };

// --- the manifest ----------------------------------------------------------

const manifestPath = join(FIXTURES_DIR, MANIFEST_FILE);
const manifestPresent = existsSync(manifestPath);
// The manifest is an array, so it cannot go through `strictParse`, which
// admits objects only; `JSON.parse` reads it and the schema check below holds
// its shape.
const manifest: unknown = manifestPresent ? JSON.parse(readFileSync(manifestPath, "utf-8")) : [];
const entries: Entry[] = Array.isArray(manifest) ? (manifest as Entry[]) : [];

describe("fixtures/manifest.json", () => {
  it(`validates against manifest.schema.json (${MANIFEST_SCHEMA_ID})`, () => {
    const set = loadSchemas(FIXTURES_DIR); // picks up fixtures/manifest.schema.json and nothing else
    expect(set.ids()).toEqual([MANIFEST_SCHEMA_ID]);
    if (!manifestPresent) {
      console.log("fixtures: no manifest yet (codec/fixtures/manifest.json is absent)");
      return;
    }
    const r = set.validate(MANIFEST_SCHEMA_ID, manifest);
    expect(r, JSON.stringify(r, null, 2)).toEqual({ ok: true });
  });
});

// --- the outcomes ----------------------------------------------------------

function outcomeOf(entry: Entry): Outcome {
  const bytes = readFileSync(join(FIXTURES_DIR, entry.path));
  const parsed = strictParse(bytes);
  if (!parsed.ok) return { ok: false, class: parsed.class, strictReason: parsed.reason, detail: parsed.detail };
  if (entry.schema === BYTES_SCHEMA) return { ok: true };
  const v = validate(entry.schema, parsed.value);
  if (v.ok) return { ok: true };
  if (v.class === "unsupported-format") return { ok: false, class: v.class, detail: `unknown schema ${v.schemaId}; known: ${v.known.join(", ")}` };
  return { ok: false, class: v.class, detail: v.errors.map((e) => `${e.instancePath || "/"} ${e.keyword}: ${e.message}`).join("; ") };
}

const isStrictReason = (s: string | undefined): s is StrictReason => (STRICT_REASONS as readonly string[]).includes(s ?? "");

describe("manifest entries", () => {
  if (entries.length === 0) {
    // Vitest fails a suite that defines no test, so the empty case is a case.
    it("none: no manifest yet", () => {
      expect(entries).toEqual([]);
    });
    return;
  }
  for (const entry of entries) {
    it(`${entry.path} [${entry.schema}] is ${entry.expect}${entry.reason ? ` (${entry.reason})` : ""}`, () => {
      const outcome = outcomeOf(entry);
      const shown = outcome.ok ? "valid" : `${outcome.class}${outcome.strictReason ? "/" + outcome.strictReason : ""}: ${outcome.detail}`;
      expect(outcome.ok, `observed ${shown}`).toBe(entry.expect === "valid");
      if (!outcome.ok) {
        expect(outcome.class, `observed ${shown}`).toBe(entry.error_class);
        if (isStrictReason(entry.reason) || entry.schema === BYTES_SCHEMA) {
          expect(outcome.strictReason, `observed ${shown}`).toBe(entry.reason);
        }
      } else if (isStrictReason(entry.reason)) {
        throw new Error(`${entry.path}: a valid fixture cannot carry the strict-reader reason "${entry.reason}"`);
      }
    });
  }
});

// --- coverage --------------------------------------------------------------

/** Every regular file under `dir`, as forward-slash paths relative to it; dotfiles excluded. */
function regularFiles(dir: string, rel = ""): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.name.startsWith(".")) continue;
    const r = rel ? `${rel}/${d.name}` : d.name;
    if (d.isDirectory()) out.push(...regularFiles(join(dir, d.name), r));
    else if (d.isFile()) out.push(r);
  }
  return out.sort();
}

// `prior/` holds the DTO round-trip pairs, `workbench/` the scratch
// workbench the store and CLI suites copy to a temp directory (FJ01 step 3),
// `protocol-session/` the recorded request/response bytes of the CLI round
// trip (FJ01 step 8, `round-trip-cli.test.ts` is their gate),
// `prior-handback/` the five files of Prior's own transition (FJ01b step 8,
// `prior-handback.test.ts` is their gate), `protocol-session-fj02/` the
// recorded FJ02 operations with their seed files (FJ02 step 9,
// `round-trip-cli-fj02.test.ts` is their gate), `protocol-session-fj02b/`
// the recorded plan progress and evidence creation with their seed files
// (FJ02b step 5, `round-trip-cli-fj02b.test.ts` is their gate) and
// `protocol-session-initialize/` the recorded `initialize`, `list.state` and
// `inspect.pending` with their base and seed files (the initialize plan's
// step 8, `round-trip-cli-initialize.test.ts` is their gate) and
// `protocol-session-archive/` the recorded archive boundary, foreign-field
// refusals and maintenance fence with their base and seed files (the archive
// revision plan's step 9, `round-trip-cli-archive.test.ts` is their gate) and
// `legacy-v12/` the v12 Markdown workbench FJ04's migration reads (the FJ04
// plan's step 1, its README lists the shapes) and
// `protocol-session-migration/` the recorded migration with its seeds (the
// FJ04 plan's step 7, `round-trip-cli-migration.test.ts` is their gate) and
// `protocol-session-takeover/` the recorded claim takeover with its base (the
// FJ05 plan's step 6, `round-trip-cli-takeover.test.ts` is their gate);
// none is a validation fixture, so none is indexed.
const isIndexed = (rel: string): boolean =>
  rel !== MANIFEST_FILE &&
  !rel.endsWith(".schema.json") &&
  !rel.startsWith("prior/") &&
  !rel.startsWith("workbench/") &&
  !rel.startsWith("protocol-session/") &&
  !rel.startsWith("prior-handback/") &&
  !rel.startsWith("protocol-session-fj02/") &&
  !rel.startsWith("protocol-session-fj02b/") &&
  !rel.startsWith("protocol-session-initialize/") &&
  !rel.startsWith("protocol-session-archive/") &&
  !rel.startsWith("legacy-v12/") &&
  !rel.startsWith("protocol-session-migration/") &&
  !rel.startsWith("protocol-session-takeover/");

describe("fixtures/ coverage", () => {
  it("every fixture file appears in the manifest exactly once, and every manifest path exists", () => {
    const onDisk = regularFiles(FIXTURES_DIR).filter(isIndexed);
    const listed = entries.map((e) => e.path);
    const counts = new Map<string, number>();
    for (const p of listed) counts.set(p, (counts.get(p) ?? 0) + 1);

    const unlisted = onDisk.filter((p) => !counts.has(p));
    const missing = [...counts.keys()].filter((p) => !onDisk.includes(p)).sort();
    const repeated = [...counts.entries()].filter(([, n]) => n > 1).map(([p, n]) => `${p} x${n}`);

    expect(unlisted, "fixture files not in the manifest").toEqual([]);
    expect(missing, "manifest paths with no file").toEqual([]);
    expect(repeated, "manifest paths listed more than once").toEqual([]);
  });

  it("reports the count of fixtures per schema and per outcome", () => {
    const perSchema = new Map<string, { valid: number; invalid: number }>();
    const perOutcome = { valid: 0, invalid: 0 };
    for (const e of entries) {
      const s = perSchema.get(e.schema) ?? { valid: 0, invalid: 0 };
      s[e.expect]++;
      perSchema.set(e.schema, s);
      perOutcome[e.expect]++;
    }
    const lines = [`fixtures: ${entries.length} manifest entr${entries.length === 1 ? "y" : "ies"}`];
    for (const [schema, s] of [...perSchema.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`  ${schema.padEnd(28)} ${String(s.valid + s.invalid).padStart(3)}  (valid ${s.valid}, invalid ${s.invalid})`);
    }
    lines.push(`  per outcome: valid ${perOutcome.valid}, invalid ${perOutcome.invalid}`);
    console.log(lines.join("\n"));
    expect(perOutcome.valid + perOutcome.invalid).toBe(entries.length);
  });
});
