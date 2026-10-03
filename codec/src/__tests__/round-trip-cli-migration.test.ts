// ---------------------------------------------------------------------------
// `migration` through `bin/fusion-record`, recorded (FJ04 step 7, as amended
// for Prior `a1fb17a`, and step 12c for Prior `d0fce6c`;
// `codec/fixtures/prior/REQUESTS.md` `## FJ04 (the contract delta, amended for
// ab9cb59)`, `## FJ04 (addendum for a1fb17a)` and `## FJ04 (addendum for
// Prior d0fce6c and ruling b1)`).
//
// Seventy exchanges, through the wrapper only, over four fresh temp copies
// of the legacy fixture `codec/fixtures/legacy-v12/workbench/` (the session's
// base, read in place and never copied into this session's directory). The
// host's work between exchanges is a seed copied onto the root (the setup
// marker and thirty generated live issues, so that the cut makes three
// chunks; the consented repairs; a note added after composition; each
// proposal; one committed intent), an edit, or a file kept and written back
// (base D). Every request
// leaves `workbench` out and is answered against `FUSION_WORKBENCH`, so no
// request digest, and no answer that carries one, depends on where the root
// lies.
//
// Base A, the run:
//   01 survey      legacy; eligible_sha256 under the whole allowlist
//   02 plan        proposal 02, five blocking findings: migration-incomplete/
//                  blocking-finding
//   -- the host's consented repairs (seed 03): three Filed by lines, the
//      duplicate step renamed 2b, the deferred Circle set paused
//   03 survey      after the repairs
//   04 plan        proposal 04 excludes `stilwerk`, outside the allowlist:
//                  schema-invalid/proposal-invalid
//   05 plan        proposal 05, composed over 03, then a note added to the
//                  store (seed 05): conflict/source-changed
//   06 survey      with the note
//   07 plan        proposal 07, composed over 06: three chunks frozen
//   08 apply 1     the fence first, named by chunk 1's id
//   09 inspect     legacy, maintenance names the fence
//   10 apply 3     chunk 3 before chunk 2: migration-incomplete/
//                  chunk-out-of-order
//   11 apply 3     over chunk 2's intent, cut in process after its commit
//                  point (seed 11): conflict/intent-pending
//   12 apply 2     the cut intent's own request finishes it: its stored answer
//   13 apply 3
//   14 verify      the receipt, then the manifest: json-control
//   15 apply 2     12 repeated after activation: 12's bytes
//   16 verify      14 repeated: 14's bytes
//   17 plan        07 repeated: 07's bytes
//   18 plan        07's proposal under a fresh id: the second-run no-op
//   19 maintenance end, naming chunk 1's fence
//   20 list        every converted record
//   21 show        an open package
//   22 show        the terminal plan the paused package binds (record-closure)
//   23 inspect     json-control, the manifest naming the receipt
//   24 maintenance begin
//   25 rollback 3  the first after activation: 18 proven a verified no-op
//                  (Prior d0fce6c) and bound under rollback.json's no_ops
//   26 rollback 2  the bound no-op checked, then the audit
//   55 rollback 1                                56 rollback 0
//   57 maintenance end on the legacy store, naming 24's fence
//   58 plan        18 repeated after the cleanup: 18's bytes
//
// Base B, a full rollback across activation (seeds 01, 03, 05 and 07 first):
//   27 plan        07's request: 07's bytes      31 verify
//   28-30 apply 1 to 3                           32 plan, 27 repeated
//   33 maintenance end, chunk 1's fence          34 maintenance begin
//   35 rollback 3  the first after activation: rollback.json, bound by hash
//   36 rollback 2  rollback.json altered by the host:
//                  conflict/plan-file-changed
//   37 rollback 2  restored                      38 rollback 1
//   39 rollback 0  the plan files, rollback.json and the index removed;
//                  progress 3, 2, 1, 0
//   40 rollback 3  35 repeated after rollback.json is gone: 35's bytes
//   41 maintenance end on the legacy store, naming 34's fence
//   42 maintenance 41 repeated: 41's bytes
//   43 apply 1     28 repeated after cleanup: 28's bytes
//   44 verify      31 repeated after cleanup: 31's bytes
//   45 inspect     legacy, maintenance null
//
// Base C, a rollback over two landed chunks (seeds 01, 03, 05 and 07 first):
//   46 plan        07's request: 07's bytes      47-48 apply 1 and 2
//   49 rollback 2  after the host wrote to a control file chunk 2 wrote:
//                  conflict/after-state-changed
//   50 rollback 2  restored                      51 rollback 1
//   52 rollback 0  progress 2, 1, 0
//   53 maintenance end on the legacy store, naming chunk 1's fence
//   54 inspect     legacy, maintenance null
//
// Base D, a refusal after real work, kept as Prior asks (seeds as B):
//   59 plan        07's request: 07's bytes      60-62 apply 1 to 3
//   63 verify                                    64 maintenance end, chunk 1's
//   65 claim       the open package: ordinary work   fence
//   66 plan        07's proposal under a fresh id: the no-op, listing 64 and
//                  65 as its diagnostic later operations
//   67 maintenance begin
//   68 rollback 3  conflict/after-state-changed: the claimed file differs from
//                  the activated tree
//   -- the host writes the file 65's revisions name back to its kept bytes
//   69 rollback 3  conflict/after-state-changed in the audit, naming 65 and
//                  not 66
//   70 maintenance end, naming 67's fence
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session-migration/` as
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json`, a GOLDEN as the
// other sessions are, rewritten only under `UPDATE_PROTOCOL_SESSION_MIGRATION=1`,
// with `seed/` and a README holding the replay procedure. Two substitutions:
//
//   - `<workbench>`, the base's absolute root, in the answers only (no request
//     names a workbench);
//   - `<since:<nn>-<op>>` for a fence's `since`, the clock when chunk 1 (08,
//     28, 47, 60) or a `begin` (24, 34, 67) lands; every later occurrence, the seeded
//     intent of 11 included, is the placeholder naming that exchange.
//
// Nothing else depends on the clock, the host or a generated id. A case
// replays the whole session from a shell through `bin/fusion-record` over a
// root whose path holds a space and a comma, found by the wrapper's own walk
// up to `.fusion-setup`.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, truncateSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { Response } from "../cli/protocol.js";
import { requestDigest, type Intent } from "../journal.js";
import { CutReached } from "../kernel.js";
import { EXCLUSION_ALLOWLIST, applyDeletions } from "../migration.js";
import { revisionOf, serialise } from "../store.js";
import { CODEC_DIR, PLACEHOLDER, WRAPPER, bytesAt, filesUnder, inJson, parse, requestBytes } from "./helpers/session.js";

// --- the fixed literals ----------------------------------------------------------

const pad = (n: number): string => String(n).padStart(2, "0");
const WB = "ab1ebe00-0000-4000-8000-000000000000";
const MID = "migration-20261002-session";
/** Record ids. */
const rid = (n: number): string => `ab1e00${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;
/** Migration operation ids. */
const oid = (n: number): string => `ab1e0f${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;
/** Maintenance operation ids, by the exchange that sends them. */
const mid = (n: number): string => `ab1e0e${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;

const APPLY = [oid(40), oid(41), oid(42), oid(43)]; // three scheduled, one unassigned
const VERIFY = oid(44);
const ROLLBACK = [oid(50), oid(51), oid(52), oid(53), oid(54)]; // four scheduled, one unassigned
const NO_OP_PLAN = oid(18);
/** Base D's no-op, and its ordinary work: an id that sorts after every migration id, so a refusal names it only once the no-op is proven. */
const NO_OP_D = oid(66);
const WORK = "ab1e1065-0000-4000-8000-000000000065";
/** The clock of the cut that commits chunk 2's intent. */
const CUT_AT = Date.parse("2026-10-02T12:00:00.000Z");

const FP = "Fixture Person <fixture@example.invalid>";
const by = (actor: string, person: string | null = FP): { actor: string; person: string | null } => ({ actor, person });
const ref = (id: string): { workbench_id: string; record_id: string } => ({ workbench_id: WB, record_id: id });

const LEGACY = join(CODEC_DIR, "fixtures", "legacy-v12", "workbench");
const ALLOWLIST = Object.keys(EXCLUSION_ALLOWLIST);
const SETUP = Buffer.from('{"setup_at":"2026-10-02T09:00:00+02:00","plugin_version":"12.0.1"}\n', "utf-8");

const WP = "work-packages";
const PATHS = {
  P1: `${WP}/260901-0900-tokenizer-handles-unicode/260901-0900-tokenizer-handles-unicode.md`,
  P2: `${WP}/260902-1000-parser-error-recovery/260902-1000-parser-error-recovery.md`,
  P3: `${WP}/260903-1200-streaming-input/260903-1200-streaming-input.md`,
  P4: `${WP}/260903-0800-lexer-table-rewrite/260903-0800-lexer-table-rewrite.md`,
  P5: `${WP}/260904-1300-regex-backend/260904-1300-regex-backend.md`,
  CC: `${WP}/260810-0900-error-messages-name-the-rule/_c_circle.md`,
  CB: `${WP}/260812-1000-grammar-coverage-report/_b_circle.md`,
  CS: `${WP}/260814-1100-incremental-reparse/_s_circle.md`,
  CD: `${WP}/260815-1400-wasm-target/_d_circle.md`,
  R1: `${WP}/260901-0900-tokenizer-handles-unicode/issues/260901-0930_o_tokenizer-rejects-combining-marks.md`,
  R2: `${WP}/260902-1000-parser-error-recovery/issues/260902-1400_p_recovery-loses-token-position.md`,
  R3: `${WP}/260903-0800-lexer-table-rewrite/issues/260904-0900_o_lexer-table-misses-tab-width.md`,
  R4: "shared/plans/260905-0900_o_plan-benchmark-suite.md",
  R5: `${WP}/260902-1000-parser-error-recovery/plans/260902-1030_p_spec-parser-error-recovery.md`,
  R6: `${WP}/260902-1000-parser-error-recovery/plans/260902-1100_p_plan-parser-error-recovery.md`,
  R7: `${WP}/260902-1000-parser-error-recovery/discussions/260902-1600_o_how-deep-may-a-recovery-unwind.md`,
  R8: "shared/decisions/260905-1200_o_should-the-ast-keep-trivia.md",
  R9: `${WP}/260902-1000-parser-error-recovery/decisions/260902-1500_a_which-sync-tokens-end-a-recovery.md`,
  R10: "shared/decisions/260905-1300_a_which-unicode-version-does-the-tokenizer-target.md",
  C1: `${WP}/260903-1200-streaming-input/plans/260903-1230_c_plan-streaming-input-first-cut.md`,
} as const;
type Key = keyof typeof PATHS;
const ID: Record<Key, string> = Object.fromEntries((Object.keys(PATHS) as Key[]).map((k, i) => [k, rid(i + 1)])) as Record<Key, string>;

/** Thirty generated live issues, so that the cut makes three chunks. */
const BULK = Array.from({ length: 30 }, (_, n) => ({
  id: rid(50 + n),
  path: `shared/issues/260907-10${pad(n)}_o_bulk-issue-${pad(n)}.md`,
  bytes: Buffer.from(`Bulk issue ${pad(n)}: one more live record, so that the cut makes three chunks\n---\nGenerated by the recorder before the first survey.\n---\n**Filed by:** reviewer, ${FP}\n`, "utf-8"),
}));
/** The note the host adds after proposal 05 was composed. */
const NOTE = { path: "shared/memos/notes-fixture-added-during-composition.md", bytes: Buffer.from("# A note added during composition\n\nIt lands after proposal 05 read the store, so plan 05 refuses.\n", "utf-8") };

// --- the consented repairs (seed 03) ---------------------------------------------------

interface Finding {
  class: string;
  severity: "blocking" | "reported";
  path: string;
  detail: string;
}
const FILED_BY_LINE = `**Filed by:** implementation-planner, ${FP}\n`;
const blocking = (cls: string, path: string, detail: string): Finding => ({ class: cls, severity: "blocking", path, detail });
const REPAIRS: ReadonlyArray<{ finding: Finding; answers: Record<string, string | null>; from: string; to: string }> = [
  { finding: blocking("filed-by-not-owed", PATHS.R5, "a live spec with no **Filed by:** line"), answers: { actor: "implementation-planner", person: FP }, from: "**Status:** Approved 2026-09-02 by the user.\n", to: `**Status:** Approved 2026-09-02 by the user.\n${FILED_BY_LINE}` },
  { finding: blocking("filed-by-not-owed", PATHS.R6, "a live plan with no **Filed by:** line"), answers: { actor: "implementation-planner", person: FP }, from: "**Status:** In progress\n", to: `**Status:** In progress\n${FILED_BY_LINE}` },
  { finding: blocking("filed-by-not-owed", PATHS.R4, "a live plan with no **Filed by:** line"), answers: { actor: "implementation-planner", person: FP }, from: "**Status:** Draft\n", to: `**Status:** Draft\n${FILED_BY_LINE}` },
  { finding: blocking("duplicate-step-number", PATHS.R4, "step 2 is numbered twice"), answers: { step: "2b" }, from: "2. **A timing harness over the parser**", to: "2b. **A timing harness over the parser**" },
  { finding: blocking("circle-deferred", PATHS.CD, "a deferred Circle has no v1 state"), answers: { status: "paused" }, from: "**Status:** deferred (to v2, by the user)\n", to: "**Status:** paused\n" },
];
const REPORTED: readonly Finding[] = [
  { class: "live-record-in-terminal-container", severity: "reported", path: PATHS.R3, detail: "an open issue under a done package" },
  { class: "answer-ref-self", severity: "reported", path: PATHS.R10, detail: "the answer is cited in prose outside the workbench; answer_ref names the decision itself" },
  { class: "circle-head-disagrees-with-marker", severity: "reported", path: PATHS.CS, detail: "the head says active, the marker superseded" },
];

/** The repaired bytes of every file a repair edits, from the legacy bytes, with each repair's pre- and post-hash. */
function repaired(read: (path: string) => Buffer): { files: Map<string, Buffer>; log: Array<Record<string, unknown>> } {
  const files = new Map<string, Buffer>();
  const log: Array<Record<string, unknown>> = [];
  for (const r of REPAIRS) {
    const before = files.get(r.finding.path) ?? read(r.finding.path);
    const text = before.toString("utf-8");
    if (text.split(r.from).length !== 2) throw new Error(`${r.finding.path}: ${JSON.stringify(r.from)} does not stand exactly once`);
    const after = Buffer.from(text.replace(r.from, r.to), "utf-8");
    files.set(r.finding.path, after);
    log.push({ finding: r.finding, answers: r.answers, pre_sha256: revisionOf(before), post_sha256: revisionOf(after) });
  }
  return { files, log };
}

// --- the record cut and the proposal ----------------------------------------------------

type Row = "package-live" | "package-terminal" | "record-live" | "record-closure";
interface Spec {
  key: Key | string;
  id: string;
  narrative: string;
  row: Row;
  kind: "package" | "issue" | "plan" | "discussion" | "decision";
  filed_by: { actor: string; person: string | null };
  /** Whole head lines the import removes, by their start. */
  strip?: string[];
  /** Exact spans the import removes (a step's mark). */
  cut?: string[];
  /** For a package, its fields beyond the common ones; for a record, its `control`. */
  build: (h: { after: (k: Key) => string; source: (k: Key) => string }) => Record<string, unknown>;
}

const marker = (path: string): string | null => /_([a-z])_[^/]*\.md$/.exec(path)?.[1] ?? null;
const openPkg = { claim: null, mode: { value: "ordinary", source: null }, origin: { kind: "user-request", ref: null }, depends_on: [], active_documents: [], outcome: null };
const circlePkg = { ...openPkg, origin: { kind: "legacy-unknown", ref: null } };
const decision = (state: string, answer_ref: unknown = null): Record<string, unknown> => ({ control: { state, answer_ref, implementation_ref: null, superseded_by: null, deferral: null } });
const issue = (state: string): Record<string, unknown> => ({ control: { state, disposition: null } });
const plan = (state: string, steps: Array<[string, string]>): Record<string, unknown> => ({ control: { state, steps: steps.map(([id, s]) => ({ id, state: s })), criteria: [], acceptance: null } });

const SPECS: readonly Spec[] = [
  { key: "P1", id: ID.P1, narrative: PATHS.P1, row: "package-live", kind: "package", filed_by: by("user"), strip: ["**Status:**", "**Depends-on:**"], build: () => ({ ...openPkg, status: "open", depends_on: [{ target: ref(ID.P4), condition: "terminal" }] }) },
  {
    key: "P2",
    id: ID.P2,
    narrative: PATHS.P2,
    row: "package-live",
    kind: "package",
    filed_by: by("user"),
    strip: ["**Status:**", "**Claim:**", "**Mode:**", "**Active spec/plan:**"],
    build: (h) => ({
      ...openPkg,
      status: "claimed",
      claim: { checkout_id: "0f1e2d3c", person: FP, claimed_at: "2026-09-02T10:15:00+02:00" },
      mode: { value: "autonomous", source: { kind: "legacy", raw: "**Mode:** autonomous" } },
      active_documents: [
        { ref: ref(ID.R5), role: "spec", revision: h.after("R5") },
        { ref: ref(ID.R6), role: "plan", revision: h.after("R6") },
      ],
    }),
  },
  { key: "P3", id: ID.P3, narrative: PATHS.P3, row: "package-live", kind: "package", filed_by: by("user"), strip: ["**Status:**", "**Active spec/plan:**", "**Depends-on:**"], build: (h) => ({ ...openPkg, status: "paused", depends_on: [{ target: ref(ID.P1), condition: "succeeded" }], active_documents: [{ ref: ref(ID.C1), role: "plan", revision: h.source("C1") }] }) },
  { key: "P4", id: ID.P4, narrative: PATHS.P4, row: "package-terminal", kind: "package", filed_by: by("user"), build: () => ({ ...openPkg, status: "done", outcome: { class: "legacy-completed", reason: "Closed before JSON control.", evidence: [] } }) },
  { key: "P5", id: ID.P5, narrative: PATHS.P5, row: "package-terminal", kind: "package", filed_by: by("user"), build: () => ({ ...openPkg, status: "dropped", outcome: { class: "dropped", reason: "Replaced by parser error recovery and the generated lexer table.", evidence: [] } }) },
  { key: "CC", id: ID.CC, narrative: PATHS.CC, row: "package-terminal", kind: "package", filed_by: by("orchestrator", null), build: () => ({ ...circlePkg, status: "done", outcome: { class: "legacy-completed", reason: "A Circle closed coherent.", evidence: [] } }) },
  { key: "CB", id: ID.CB, narrative: PATHS.CB, row: "package-terminal", kind: "package", filed_by: by("shaper", null), build: () => ({ ...circlePkg, status: "dropped", outcome: { class: "bounded", reason: "The expression rules were left out of scope.", evidence: [] } }) },
  { key: "CS", id: ID.CS, narrative: PATHS.CS, row: "package-terminal", kind: "package", filed_by: by("shaper", null), build: () => ({ ...circlePkg, status: "dropped", outcome: { class: "dropped", reason: "Superseded when the streaming work took over its scope.", evidence: [] } }) },
  { key: "CD", id: ID.CD, narrative: PATHS.CD, row: "package-live", kind: "package", filed_by: by("shaper", null), strip: ["**Status:**"], build: () => ({ ...circlePkg, status: "paused" }) },
  { key: "R1", id: ID.R1, narrative: PATHS.R1, row: "record-live", kind: "issue", filed_by: by("code-implementer"), build: () => issue("open") },
  { key: "R2", id: ID.R2, narrative: PATHS.R2, row: "record-live", kind: "issue", filed_by: by("reviewer"), build: () => issue("in_progress") },
  { key: "R3", id: ID.R3, narrative: PATHS.R3, row: "record-live", kind: "issue", filed_by: by("reviewer"), build: () => issue("open") },
  { key: "R4", id: ID.R4, narrative: PATHS.R4, row: "record-live", kind: "plan", filed_by: by("implementation-planner"), strip: ["**Status:**"], build: () => plan("open", [["1", "open"], ["2", "open"], ["2b", "open"]]) },
  { key: "R5", id: ID.R5, narrative: PATHS.R5, row: "record-live", kind: "plan", filed_by: by("implementation-planner"), strip: ["**Status:**"], build: () => plan("in_progress", []) },
  {
    key: "R6",
    id: ID.R6,
    narrative: PATHS.R6,
    row: "record-live",
    kind: "plan",
    filed_by: by("implementation-planner"),
    strip: ["**Status:**"],
    cut: ["[DONE] ", "[IN PROGRESS] ", "[OPEN] "],
    build: () => plan("in_progress", [["1", "done"], ["2", "in_progress"], ["12a", "open"], ["12b", "open"]]),
  },
  { key: "R7", id: ID.R7, narrative: PATHS.R7, row: "record-live", kind: "discussion", filed_by: by("orchestrator"), build: () => ({ control: { state: "open", participants: [by("orchestrator", null), by("consultant", null)], outcome_refs: [] } }) },
  { key: "R8", id: ID.R8, narrative: PATHS.R8, row: "record-live", kind: "decision", filed_by: by("implementation-planner"), build: () => decision("open") },
  { key: "R9", id: ID.R9, narrative: PATHS.R9, row: "record-live", kind: "decision", filed_by: by("implementation-planner"), build: () => decision("answered", ref(ID.R6)) },
  { key: "R10", id: ID.R10, narrative: PATHS.R10, row: "record-live", kind: "decision", filed_by: by("implementation-planner"), build: () => decision("answered", "260905-1300_a_which-unicode-version-does-the-tokenizer-target.md") },
  { key: "C1", id: ID.C1, narrative: PATHS.C1, row: "record-closure", kind: "plan", filed_by: by("implementation-planner", null), build: () => plan("closed", [["1", "done"], ["2", "done"]]) },
  ...BULK.map((b, n): Spec => ({ key: `bulk-${pad(n)}`, id: b.id, narrative: b.path, row: "record-live", kind: "issue", filed_by: by("reviewer"), build: () => issue("open") })),
];

/** The byte ranges of `spec`'s control lines and marks in `bytes`, in order; each must stand exactly once. */
function deletionsOf(spec: Spec, bytes: Buffer): Array<{ offset: number; length: number }> {
  const text = bytes.toString("utf-8");
  const out: Array<{ offset: number; length: number }> = [];
  const once = (what: string, hits: number[]): number => {
    if (hits.length !== 1) throw new Error(`${spec.narrative}: ${JSON.stringify(what)} stands ${hits.length} times`);
    return hits[0] as number;
  };
  const all = (needle: string): number[] => {
    const hits: number[] = [];
    for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + 1)) hits.push(i);
    return hits;
  };
  for (const prefix of spec.strip ?? []) {
    const at = once(prefix, all(`\n${prefix}`).map((i) => i + 1));
    const end = text.indexOf("\n", at) + 1;
    out.push({ offset: Buffer.byteLength(text.slice(0, at)), length: Buffer.byteLength(text.slice(at, end)) });
  }
  for (const span of spec.cut ?? []) {
    const at = once(span, all(span));
    out.push({ offset: Buffer.byteLength(text.slice(0, at)), length: Buffer.byteLength(span) });
  }
  return out.sort((a, b) => a.offset - b.offset);
}

const backupOf = (narrative: string): string => `archive/migrations/${MID}/originals/${narrative}`;

/**
 * The proposal the host composes over `root` as it stands, copying `eligible`
 * from the survey it composed after (C9, option 1). Every live narrative with
 * control lines is rewritten by deletions alone; terminal ones stay
 * byte-identical.
 */
function compose(root: string, o: { plan: string; eligible: string; findings: readonly Finding[]; repairs: unknown[]; exclusions?: string[] }): Buffer {
  const source = new Map<string, Buffer>();
  const rewrite = new Map<string, { after_sha256: string; deletions: Array<{ offset: number; length: number }> } | null>();
  for (const s of SPECS) {
    const bytes = readFileSync(join(root, s.narrative));
    source.set(s.key, bytes);
    const live = s.row === "package-live" || s.row === "record-live";
    const deletions = live ? deletionsOf(s, bytes) : [];
    if (deletions.length === 0) rewrite.set(s.key, null);
    else {
      const out = applyDeletions(bytes, deletions);
      if (!out.ok) throw new Error(out.why);
      rewrite.set(s.key, { after_sha256: revisionOf(out.bytes), deletions });
    }
  }
  const h = {
    source: (k: Key): string => revisionOf(source.get(k) as Buffer),
    after: (k: Key): string => rewrite.get(k)?.after_sha256 ?? revisionOf(source.get(k) as Buffer),
  };
  const records: Record<string, unknown> = {};
  for (const s of SPECS) {
    const sha = revisionOf(source.get(s.key) as Buffer);
    const terminal = s.row === "package-terminal" || s.row === "record-closure";
    const rw = rewrite.get(s.key) ?? null;
    const removed = rw === null ? [] : rw.deletions.map((d) => (source.get(s.key) as Buffer).subarray(d.offset, d.offset + d.length).toString("utf-8"));
    const provenance = { source: terminal ? "legacy-terminal" : "imported", legacy_fields: { file_marker: marker(s.narrative), removed }, backup: { path: backupOf(s.narrative), sha256: sha, kind: "other" } };
    const dir = dirname(s.narrative);
    const common = { id: s.id, workbench_id: WB };
    const control =
      s.kind === "package"
        ? { schema: "fusion.package/v1", ...common, domain: "code", filed_by: s.filed_by, narrative: { path: s.narrative }, references: [], evidence: [], provenance, extensions: {}, ...s.build(h) }
        : { schema: "fusion.record/v1", ...common, kind: s.kind, narrative: { path: s.narrative }, filed_by: s.filed_by, references: [], provenance, extensions: {}, ...s.build(h) };
    records[s.id] = {
      row: s.row,
      kind: s.kind,
      narrative: s.narrative,
      source_sha256: sha,
      control_path: s.kind === "package" ? `${dir}/package.json` : `${s.narrative.slice(0, -".md".length)}.record.json`,
      backup: backupOf(s.narrative),
      rewrite: rw,
      control,
    };
  }
  const n = (row: Row): number => SPECS.filter((s) => s.row === row).length;
  return Buffer.from(
    serialise({
      schema: "fusion.migration-proposal/v1",
      migration_id: MID,
      workbench_id: WB,
      source_layout: "fusion-v12",
      source_inventory_sha256: o.eligible,
      operation_ids: { plan: o.plan, apply: APPLY, verify: VERIFY, rollback: ROLLBACK },
      exclusions: o.exclusions ?? ALLOWLIST,
      records,
      counts: { package_live: n("package-live"), package_terminal: n("package-terminal"), record_live: n("record-live"), record_closure: n("record-closure"), plain_terminal: 10, empty_container: 0 },
      findings: o.findings,
      repairs: o.repairs,
    }),
    "utf-8",
  );
}

const proposalPath = (name: string): string => `.json-state/migration/proposal-${name.slice(0, 2)}.json`;

// --- the exchanges ---------------------------------------------------------------------

const NAMES = [
  "01-survey", "02-plan", "03-survey", "04-plan", "05-plan", "06-survey", "07-plan", "08-apply", "09-inspect", "10-apply",
  "11-apply", "12-apply", "13-apply", "14-verify", "15-apply", "16-verify", "17-plan", "18-plan", "19-maintenance", "20-list",
  "21-show", "22-show", "23-inspect", "24-maintenance", "25-rollback", "26-rollback", "55-rollback", "56-rollback", "57-maintenance", "58-plan",
  "27-plan", "28-apply", "29-apply", "30-apply", "31-verify", "32-plan", "33-maintenance", "34-maintenance", "35-rollback", "36-rollback",
  "37-rollback", "38-rollback", "39-rollback", "40-rollback", "41-maintenance", "42-maintenance", "43-apply", "44-verify", "45-inspect",
  "46-plan", "47-apply", "48-apply", "49-rollback", "50-rollback", "51-rollback", "52-rollback", "53-maintenance", "54-inspect",
  "59-plan", "60-apply", "61-apply", "62-apply", "63-verify", "64-maintenance", "65-claim", "66-plan", "67-maintenance", "68-rollback",
  "69-rollback", "70-maintenance",
] as const;
type Name = (typeof NAMES)[number];
type Base = "a" | "b" | "c" | "d";
const BASES: readonly Base[] = ["a", "b", "c", "d"];

/**
 * The host's work immediately before an exchange: a committed seed copied
 * onto the root, a text appended to a file, a file cut back by bytes, or a
 * file's bytes kept and later written back.
 */
type HostAction = { seed: Name } | { append: [string, string] } | { chop: [string, number] } | { keep: string } | { restore: string };

/** The seeds, each produced in base A by the exchange it precedes. */
const SEEDED: readonly Name[] = ["01-survey", "02-plan", "03-survey", "04-plan", "05-plan", "07-plan", "11-apply"];
const PREPARED: HostAction[] = [{ seed: "01-survey" }, { seed: "03-survey" }, { seed: "05-plan" }, { seed: "07-plan" }];
const ROLLBACK_FILE = `archive/migrations/${MID}/rollback.json`;
/** A control file chunk 2 writes (a case below holds it), where the host writes in base C. */
const C_WRITE = `${PATHS.R4.slice(0, -".md".length)}.record.json`;

/** The package base D claims, an open one, and its control: the file the claim writes and the host writes back. */
const CLAIMED = `${dirname(PATHS.P1)}/package.json`;

/** The fence setters: chunk 1's first apply and each begin. Their `since` is recorded as `<since:<name>>`. */
const SETTERS: readonly Name[] = ["08-apply", "24-maintenance", "28-apply", "34-maintenance", "47-apply", "60-apply", "67-maintenance"];
const sincePlaceholder = (name: Name): string => `<since:${name}>`;
const sinceOf = (name: Name, response: Response): string => {
  if (!response.ok) throw new Error(`${name} did not land`);
  const r = response.result as { since?: string; fence?: { since: string } };
  return (name.endsWith("-apply") ? r.fence?.since : r.since) as string;
};

/** The plan reference every later phase binds, from 07's answer. */
let PLAN: { path: string; sha256: string };
const planRef = (): { path: string; sha256: string } => PLAN;

const survey = (): object => ({ op: "migration", phase: "survey" });
const planReq = (id: string, name: string, sha: () => string): (() => object) => () => ({ op: "migration", operation_id: id, phase: "plan", proposal: { path: proposalPath(name), sha256: sha() } });
const apply = (n: number): (() => object) => () => ({ chunk: n, op: "migration", operation_id: APPLY[n - 1], phase: "apply", plan: planRef() });
const verify = (): object => ({ op: "migration", operation_id: VERIFY, phase: "verify", plan: planRef() });
const rollback = (k: number): (() => object) => () => ({ chunk: k, op: "migration", operation_id: ROLLBACK[k], phase: "rollback", plan: planRef() });
const begin = (n: number): object => ({ action: "begin", op: "maintenance", operation_id: mid(n) });
/** Base D's claim of the open package, at the revision its control has when the claim is sent. */
const claim = (): object => ({
  op: "claim",
  operation_id: WORK,
  record: { path: CLAIMED },
  expected_revision: revisionOf(readFileSync(join(run.root.d, CLAIMED))),
  actor: by("user"),
  claim: { checkout_id: "0f1e2d3c", person: FP, claimed_at: "2026-10-02T13:00:00+02:00" },
});
const end = (n: number, fence: string): object => ({ action: "end", fence, op: "maintenance", operation_id: mid(n) });

/** Each proposal's bytes, by the exchange whose seed holds it. */
const proposals = new Map<string, Buffer>();
/** The sha256 a plan request binds: of the committed seed's bytes, which are what the store holds. */
const shaOf = (name: string) => (): string => revisionOf(bytesAt(join(SEED, name), proposalPath(name)));

interface Step {
  name: Name;
  base: Base;
  before: readonly HostAction[];
  request: object | (() => object);
}

const STEPS: readonly Step[] = [
  { name: "01-survey", base: "a", before: [{ seed: "01-survey" }], request: survey() },
  { name: "02-plan", base: "a", before: [{ seed: "02-plan" }], request: planReq(oid(2), "02-plan", shaOf("02-plan")) },
  { name: "03-survey", base: "a", before: [{ seed: "03-survey" }], request: survey() },
  { name: "04-plan", base: "a", before: [{ seed: "04-plan" }], request: planReq(oid(4), "04-plan", shaOf("04-plan")) },
  { name: "05-plan", base: "a", before: [{ seed: "05-plan" }], request: planReq(oid(5), "05-plan", shaOf("05-plan")) },
  { name: "06-survey", base: "a", before: [], request: survey() },
  { name: "07-plan", base: "a", before: [{ seed: "07-plan" }], request: planReq(oid(7), "07-plan", shaOf("07-plan")) },
  { name: "08-apply", base: "a", before: [], request: apply(1) },
  { name: "09-inspect", base: "a", before: [], request: { op: "inspect" } },
  { name: "10-apply", base: "a", before: [], request: apply(3) },
  { name: "11-apply", base: "a", before: [{ seed: "11-apply" }], request: apply(3) },
  { name: "12-apply", base: "a", before: [], request: apply(2) },
  { name: "13-apply", base: "a", before: [], request: apply(3) },
  { name: "14-verify", base: "a", before: [], request: verify },
  { name: "15-apply", base: "a", before: [], request: apply(2) },
  { name: "16-verify", base: "a", before: [], request: verify },
  { name: "17-plan", base: "a", before: [], request: planReq(oid(7), "07-plan", shaOf("07-plan")) },
  { name: "18-plan", base: "a", before: [], request: planReq(NO_OP_PLAN, "07-plan", shaOf("07-plan")) },
  { name: "19-maintenance", base: "a", before: [], request: end(19, APPLY[0] as string) },
  { name: "20-list", base: "a", before: [], request: { op: "list" } },
  { name: "21-show", base: "a", before: [], request: { op: "show", record: { path: `${dirname(PATHS.P1)}/package.json` } } },
  { name: "22-show", base: "a", before: [], request: { op: "show", record: { path: `${PATHS.C1.slice(0, -".md".length)}.record.json` } } },
  { name: "23-inspect", base: "a", before: [], request: { op: "inspect" } },
  { name: "24-maintenance", base: "a", before: [], request: begin(24) },
  { name: "25-rollback", base: "a", before: [], request: rollback(3) },
  { name: "26-rollback", base: "a", before: [], request: rollback(2) },
  { name: "55-rollback", base: "a", before: [], request: rollback(1) },
  { name: "56-rollback", base: "a", before: [], request: rollback(0) },
  { name: "57-maintenance", base: "a", before: [], request: end(57, mid(24)) },
  { name: "58-plan", base: "a", before: [], request: planReq(NO_OP_PLAN, "07-plan", shaOf("07-plan")) },

  { name: "27-plan", base: "b", before: PREPARED, request: planReq(oid(7), "07-plan", shaOf("07-plan")) },
  { name: "28-apply", base: "b", before: [], request: apply(1) },
  { name: "29-apply", base: "b", before: [], request: apply(2) },
  { name: "30-apply", base: "b", before: [], request: apply(3) },
  { name: "31-verify", base: "b", before: [], request: verify },
  { name: "32-plan", base: "b", before: [], request: planReq(oid(7), "07-plan", shaOf("07-plan")) },
  { name: "33-maintenance", base: "b", before: [], request: end(33, APPLY[0] as string) },
  { name: "34-maintenance", base: "b", before: [], request: begin(34) },
  { name: "35-rollback", base: "b", before: [], request: rollback(3) },
  { name: "36-rollback", base: "b", before: [{ append: [ROLLBACK_FILE, "\n"] }], request: rollback(2) },
  { name: "37-rollback", base: "b", before: [{ chop: [ROLLBACK_FILE, 1] }], request: rollback(2) },
  { name: "38-rollback", base: "b", before: [], request: rollback(1) },
  { name: "39-rollback", base: "b", before: [], request: rollback(0) },
  { name: "40-rollback", base: "b", before: [], request: rollback(3) },
  { name: "41-maintenance", base: "b", before: [], request: end(41, mid(34)) },
  { name: "42-maintenance", base: "b", before: [], request: end(41, mid(34)) },
  { name: "43-apply", base: "b", before: [], request: apply(1) },
  { name: "44-verify", base: "b", before: [], request: verify },
  { name: "45-inspect", base: "b", before: [], request: { op: "inspect" } },

  { name: "46-plan", base: "c", before: PREPARED, request: planReq(oid(7), "07-plan", shaOf("07-plan")) },
  { name: "47-apply", base: "c", before: [], request: apply(1) },
  { name: "48-apply", base: "c", before: [], request: apply(2) },
  { name: "49-rollback", base: "c", before: [{ append: [C_WRITE, "\n"] }], request: rollback(2) },
  { name: "50-rollback", base: "c", before: [{ chop: [C_WRITE, 1] }], request: rollback(2) },
  { name: "51-rollback", base: "c", before: [], request: rollback(1) },
  { name: "52-rollback", base: "c", before: [], request: rollback(0) },
  { name: "53-maintenance", base: "c", before: [], request: end(53, APPLY[0] as string) },
  { name: "54-inspect", base: "c", before: [], request: { op: "inspect" } },

  { name: "59-plan", base: "d", before: PREPARED, request: planReq(oid(7), "07-plan", shaOf("07-plan")) },
  { name: "60-apply", base: "d", before: [], request: apply(1) },
  { name: "61-apply", base: "d", before: [], request: apply(2) },
  { name: "62-apply", base: "d", before: [], request: apply(3) },
  { name: "63-verify", base: "d", before: [], request: verify },
  { name: "64-maintenance", base: "d", before: [], request: end(64, APPLY[0] as string) },
  { name: "65-claim", base: "d", before: [{ keep: CLAIMED }], request: claim },
  { name: "66-plan", base: "d", before: [], request: planReq(NO_OP_D, "07-plan", shaOf("07-plan")) },
  { name: "67-maintenance", base: "d", before: [], request: begin(67) },
  { name: "68-rollback", base: "d", before: [], request: rollback(3) },
  { name: "69-rollback", base: "d", before: [{ restore: CLAIMED }], request: rollback(3) },
  { name: "70-maintenance", base: "d", before: [], request: end(70, mid(67)) },
];

/** The exchanges refused, each with the one reason it is recorded for. */
const REFUSED: ReadonlyMap<Name, [string, string]> = new Map<Name, [string, string]>([
  ["02-plan", ["migration-incomplete", "blocking-finding"]],
  ["04-plan", ["schema-invalid", "proposal-invalid"]],
  ["05-plan", ["conflict", "source-changed"]],
  ["10-apply", ["migration-incomplete", "chunk-out-of-order"]],
  ["11-apply", ["conflict", "intent-pending"]],
  ["36-rollback", ["conflict", "plan-file-changed"]],
  ["49-rollback", ["conflict", "after-state-changed"]],
  ["68-rollback", ["conflict", "after-state-changed"]],
  ["69-rollback", ["conflict", "after-state-changed"]],
]);

/** Each repeated request and the exchange whose bytes it answers. */
const REPEATS: ReadonlyArray<[Name, Name]> = [
  ["15-apply", "12-apply"],
  ["16-verify", "14-verify"],
  ["17-plan", "07-plan"],
  ["27-plan", "07-plan"],
  ["32-plan", "27-plan"],
  ["40-rollback", "35-rollback"],
  ["42-maintenance", "41-maintenance"],
  ["43-apply", "28-apply"],
  ["44-verify", "31-verify"],
  ["46-plan", "07-plan"],
  ["58-plan", "18-plan"],
  ["59-plan", "07-plan"],
];

// --- the session machinery ---------------------------------------------------------------

const SESSION = join(CODEC_DIR, "fixtures", "protocol-session-migration");
const SEED = join(SESSION, "seed");
const UPDATE = process.env.UPDATE_PROTOCOL_SESSION_MIGRATION === "1";
const FIX = "UPDATE_PROTOCOL_SESSION_MIGRATION=1";

interface Run {
  /** The project directory of each base; its workbench is `fusion-workbench/` under it. */
  project: Record<Base, string>;
  root: Record<Base, string>;
  /** Each setter's since in this run. */
  since: Map<Name, string>;
  /** The bytes a `keep` action took, by path, for its `restore`. */
  kept: Map<string, Buffer>;
}

const placeholdersOf = (run: Run): Array<[string, string]> => [...run.since].map(([n, v]) => [v, sincePlaceholder(n)]);
/** `text` as it is recorded: the base's root, then every since. */
const recordText = (run: Run, base: Base, text: string): string => placeholdersOf(run).reduce((t, [v, p]) => t.split(v).join(p), text.split(inJson(run.root[base])).join(PLACEHOLDER));
/** `text` as it is replayed. */
const replayText = (run: Run, base: Base, text: string): string => placeholdersOf(run).reduce((t, [v, p]) => t.split(p).join(v), text).split(PLACEHOLDER).join(inJson(run.root[base]));

function newRun(tmp: string, label: string): Run {
  const project = {} as Record<Base, string>;
  const root = {} as Record<Base, string>;
  for (const base of BASES) {
    project[base] = join(tmp, label, base);
    root[base] = join(project[base], "fusion-workbench");
    mkdirSync(project[base], { recursive: true });
    // The fixture holds one link; it is copied as a link with its own text.
    cpSync(LEGACY, root[base], { recursive: true, verbatimSymlinks: true });
  }
  return { project, root, since: new Map(), kept: new Map() };
}

/** Copies the committed seed `name` onto the root, each since placeholder replaced by this run's value. */
function copySeed(run: Run, base: Base, name: Name): void {
  const dir = join(SEED, name);
  for (const path of filesUnder(dir)) {
    let bytes = bytesAt(dir, path);
    if (bytes.includes("<since:")) bytes = Buffer.from(replayText(run, base, bytes.toString("utf-8")), "utf-8");
    mkdirSync(dirname(join(run.root[base], path)), { recursive: true });
    writeFileSync(join(run.root[base], path), bytes);
  }
}

function host(run: Run, base: Base, actions: readonly HostAction[], produce?: (name: Name) => void): void {
  for (const a of actions) {
    if ("seed" in a) {
      produce?.(a.seed);
      copySeed(run, base, a.seed);
    } else if ("append" in a) appendFileSync(join(run.root[base], a.append[0]), a.append[1]);
    else if ("keep" in a) run.kept.set(a.keep, readFileSync(join(run.root[base], a.keep)));
    else if ("restore" in a) writeFileSync(join(run.root[base], a.restore), run.kept.get(a.restore) as Buffer);
    else {
      const file = join(run.root[base], a.chop[0]);
      truncateSync(file, statSync(file).size - a.chop[1]);
    }
  }
}

interface Exchange {
  name: Name;
  base: Base;
  request: Record<string, unknown>;
  stdout: string;
  stderr: string;
  status: number | null;
}

/** The environment of every exchange: no inherited workbench. */
const bareEnv = (): NodeJS.ProcessEnv => {
  const { FUSION_WORKBENCH: _drop, ...env } = process.env;
  return env;
};

// --- the recording ---------------------------------------------------------------------

let tmp: string;
let run: Run;
/** Base A's rollback.json as 25 wrote it; 56 removes it. */
let boundA: Buffer;
const exchanges: Exchange[] = [];
const byName = (name: Name): Exchange => {
  const e = exchanges.find((x) => x.name === name);
  if (e === undefined) throw new Error(`no exchange ${name}`);
  return e;
};
const resultOf = (name: Name): Record<string, unknown> => {
  const r = parse(byName(name).stdout);
  expect(r.ok, `${name}: ${byName(name).stdout}`).toBe(true);
  return (r as { result: Record<string, unknown> }).result;
};
const eligibleOf = (name: Name): string => resultOf(name).eligible_sha256 as string;

/** What each seed must hold, computed by the run. */
const expectedSeeds = new Map<Name, Map<string, Buffer>>();

/** Produces seed `name` from the store of base A as it stands, rewriting it under the update variable. */
function produce(name: Name): void {
  if (expectedSeeds.has(name)) return;
  const root = run.root.a;
  const files = new Map<string, Buffer>();
  const put = (path: string, bytes: Buffer): void => {
    files.set(path, bytes);
  };
  const legacyRead = (path: string): Buffer => readFileSync(join(LEGACY, path));
  const repairs = repaired(legacyRead);
  const findings = [...REPAIRS.map((r) => r.finding), ...REPORTED];
  switch (name) {
    case "01-survey":
      put(".fusion-setup", SETUP);
      for (const b of BULK) put(b.path, b.bytes);
      break;
    case "02-plan":
      put(proposalPath(name), compose(root, { plan: oid(2), eligible: eligibleOf("01-survey"), findings, repairs: [] }));
      break;
    case "03-survey":
      for (const [path, bytes] of repairs.files) put(path, bytes);
      break;
    case "04-plan":
      put(proposalPath(name), compose(root, { plan: oid(4), eligible: eligibleOf("03-survey"), findings: REPORTED, repairs: repairs.log, exclusions: [...ALLOWLIST, "stilwerk"] }));
      break;
    case "05-plan":
      // Composed over 03's survey; the note lands after composition.
      put(proposalPath(name), compose(root, { plan: oid(5), eligible: eligibleOf("03-survey"), findings: REPORTED, repairs: repairs.log }));
      put(NOTE.path, NOTE.bytes);
      break;
    case "07-plan":
      put(proposalPath(name), compose(root, { plan: oid(7), eligible: eligibleOf("06-survey"), findings: REPORTED, repairs: repairs.log }));
      break;
    case "11-apply":
      if (cutFiles === undefined) throw new Error("the cut of 12-apply was not prepared");
      for (const [path, bytes] of cutFiles) put(path, bytes);
      break;
    default:
      throw new Error(`no seed for ${name}`);
  }
  for (const [path, bytes] of files) if (path.startsWith(".json-state/migration/")) proposals.set(name, bytes);
  expectedSeeds.set(name, files);
  if (UPDATE) {
    rmSync(join(SEED, name), { recursive: true, force: true });
    for (const [path, bytes] of files) {
      mkdirSync(dirname(join(SEED, name, path)), { recursive: true });
      writeFileSync(join(SEED, name, path), bytes);
    }
  }
}

/**
 * Chunk 2's committed intent: its own request dispatched in process over a
 * scratch copy of base A, cut after its commit point with a fixed clock, the
 * journal directory alone kept and chunk 1's since recorded as its
 * placeholder. The request names no workbench, so its digest is the one the
 * wrapper's request carries on any root. `dispatch` is async, so `beforeAll`
 * awaits this before seed 11 is produced.
 */
let cutFiles: Map<string, Buffer> | undefined;
async function prepareCut(): Promise<void> {
  const scratch = join(tmp, "cut");
  rmSync(scratch, { recursive: true, force: true });
  cpSync(run.root.a, scratch, { recursive: true, verbatimSymlinks: true });
  const request = apply(2)();
  let cut: unknown;
  try {
    await dispatch(request, { defaultWorkbench: scratch, kernel: { now: () => CUT_AT, faults: { cutAt: "after-intent" } } });
  } catch (e) {
    cut = e;
  }
  if (!(cut instanceof CutReached)) throw new Error(`the cut of 12-apply was not reached: ${String(cut)}`);
  const journal = ".json-state/journal";
  const since = run.since.get("08-apply") as string;
  const files = new Map<string, Buffer>();
  for (const path of filesUnder(join(scratch, journal))) {
    let bytes = bytesAt(scratch, `${journal}/${path}`);
    if (path.endsWith("/intent.json")) {
      const text = bytes.toString("utf-8");
      if (text.includes(scratch)) throw new Error("the intent names the scratch path");
      if (text.split(JSON.stringify(since)).length !== 2) throw new Error("the intent does not carry chunk 1's since exactly once");
      bytes = Buffer.from(text.replace(JSON.stringify(since), JSON.stringify(sincePlaceholder("08-apply"))), "utf-8");
    }
    files.set(`${journal}/${path}`, bytes);
  }
  rmSync(scratch, { recursive: true, force: true });
  cutFiles = files;
}

function send(name: Name, base: Base, request: Record<string, unknown>): Exchange {
  const env = { ...bareEnv(), FUSION_WORKBENCH: run.root[base] };
  const r = spawnSync(WRAPPER, [], { input: requestBytes(request), cwd: run.project[base], encoding: "utf-8", env });
  const e: Exchange = { name, base, request, stdout: r.stdout ?? "", stderr: r.stderr ?? "", status: r.status };
  exchanges.push(e);
  if (SETTERS.includes(name)) run.since.set(name, sinceOf(name, parse(e.stdout)));
  return e;
}

// --- the shell replay ------------------------------------------------------------------

interface Replayed {
  name: Name;
  stdout: string;
  expected: string;
  status: number | null;
  stderr: string;
}
const replayed: Replayed[] = [];
let replayRoot = "";

/**
 * The whole session again, from a shell, over roots whose path holds a space
 * and a comma: each base copied from the fixture, each host action done as
 * the step names it, each committed seed copied with its since placeholders
 * resolved, and each recorded request file fed to `bin/fusion-record` by
 * bash from the project directory, the wrapper finding the workbench by its
 * own walk up to `.fusion-setup`. The workbench placeholder resolves to the
 * real path the walk-up prints.
 */
function shellReplay(): void {
  const r = newRun(tmp, "replay dir, with space");
  for (const base of BASES) r.root[base] = join(realpathSync(r.project[base]), "fusion-workbench");
  replayRoot = r.root.a;
  for (const step of STEPS) {
    host(r, step.base, step.before);
    const out = spawnSync("bash", ["-c", 'cd "$1" && exec "$2" < "$3"', "replay", r.project[step.base], WRAPPER, join(SESSION, `${step.name}.request.json`)], { encoding: "utf-8", env: bareEnv() });
    const stdout = out.stdout ?? "";
    if (SETTERS.includes(step.name)) r.since.set(step.name, sinceOf(step.name, parse(stdout)));
    const recorded = readFileSync(join(SESSION, `${step.name}.response.json`), "utf-8");
    replayed.push({ name: step.name, stdout, expected: replayText(r, step.base, recorded), status: out.status, stderr: out.stderr ?? "" });
  }
}

beforeAll(async () => {
  tmp = mkdtempSync(join(tmpdir(), "codec-round-trip-migration-"));
  run = newRun(tmp, "record");
  if (UPDATE) mkdirSync(SEED, { recursive: true });
  for (const step of STEPS) {
    if (step.name === "11-apply") await prepareCut();
    host(run, step.base, step.before, (n) => {
      if (step.base === "a") produce(n);
    });
    const request = (typeof step.request === "function" ? step.request() : step.request) as Record<string, unknown>;
    send(step.name, step.base, request);
    if (step.name === "07-plan") PLAN = resultOf("07-plan").plan as { path: string; sha256: string };
    if (step.name === "25-rollback") boundA = readFileSync(join(run.root.a, ROLLBACK_FILE));
  }
  if (UPDATE) {
    for (const e of exchanges) {
      writeFileSync(join(SESSION, `${e.name}.request.json`), recordText(run, e.base, requestBytes(e.request)));
      writeFileSync(join(SESSION, `${e.name}.response.json`), recordText(run, e.base, e.stdout));
    }
  }
  shellReplay();
}, 300_000);

afterAll(() => {
  if (tmp !== undefined) rmSync(tmp, { recursive: true, force: true });
});

// --- what each exchange answered ---------------------------------------------------------

const refusalOf = (name: Name): { class: string; reason: string; detail: string } => {
  const r = parse(byName(name).stdout);
  expect(r.ok, `${name}: ${byName(name).stdout}`).toBe(false);
  return (r as { error: { class: string; reason: string; detail: string } }).error;
};

describe("the seventy migration exchanges through bin/fusion-record", () => {
  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual([...NAMES]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("every request leaves the workbench out, so no recorded byte depends on the root", () => {
    for (const e of exchanges) expect(Object.keys(e.request), e.name).not.toContain("workbench");
  });

  it("the refused exchanges are exactly the nine named, each with its reason; every other answer is ok", () => {
    for (const name of NAMES) {
      const r = parse(byName(name).stdout);
      const want = REFUSED.get(name);
      if (want === undefined) expect(r.ok, `${name}: ${byName(name).stdout}`).toBe(true);
      else expect(refusalOf(name), name).toMatchObject({ class: want[0], reason: want[1] });
    }
  });

  it("01, 03 and 06: survey reads the legacy store; each eligible digest is the one the next proposal binds", () => {
    expect(resultOf("01-survey")).toMatchObject({ layout: "legacy", local_state: { present: false, intents: [], maintenance: null, unreadable: [] } });
    const digests = (["01-survey", "03-survey", "06-survey"] as const).map(eligibleOf);
    expect(new Set(digests).size, "the repairs and the note each change the eligible inventory").toBe(3);
    const bound = (name: Name): string => (JSON.parse((proposals.get(name) as Buffer).toString("utf-8")) as { source_inventory_sha256: string }).source_inventory_sha256;
    expect([bound("02-plan"), bound("04-plan"), bound("05-plan"), bound("07-plan")]).toEqual([digests[0], digests[1], digests[1], digests[2]]);
  });

  it("02: the five blocking findings refuse plan before the disk is read; the repairs of seed 03 are the log the later proposals carry", () => {
    expect(refusalOf("02-plan").detail).toContain("5 blocking findings open");
    const log = (JSON.parse((proposals.get("07-plan") as Buffer).toString("utf-8")) as { repairs: Array<{ pre_sha256: string; post_sha256: string; finding: Finding }> }).repairs;
    expect(log.map((r) => r.finding.class)).toEqual(["filed-by-not-owed", "filed-by-not-owed", "filed-by-not-owed", "duplicate-step-number", "circle-deferred"]);
    for (const r of log) expect(r.pre_sha256, r.finding.path).not.toBe(r.post_sha256);
  });

  it("04: an exclusion outside the allowlist is proposal-invalid; 05: a file added after composition is source-changed, naming both digests", () => {
    expect(refusalOf("04-plan").detail).toContain("exclusions");
    expect(refusalOf("05-plan").detail).toContain(eligibleOf("03-survey"));
  });

  it("07: the freeze names three chunks, the schedule's ids, the cut's counts and an empty answers baseline", () => {
    const r = resultOf("07-plan");
    expect(r.schedule).toEqual({ plan: oid(7), apply: APPLY.slice(0, 3).map((operation_id, i) => ({ chunk: i + 1, operation_id })), verify: VERIFY, rollback: ROLLBACK.slice(0, 4).map((operation_id, k) => ({ chunk: k, operation_id })), unassigned: [APPLY[3], ROLLBACK[4]] });
    expect((r.parts as Array<{ part: string }>).filter((p) => p.part === "chunk")).toHaveLength(3);
    expect(r.counts).toEqual({ package_live: 4, package_terminal: 5, record_live: 40, record_closure: 1, plain_terminal: 10, empty_container: 0 });
  });

  it("08 and 09: chunk 1 sets the fence under its own id; inspect names it on the legacy store", () => {
    expect((resultOf("08-apply").fence as { operation_id: string }).operation_id).toBe(APPLY[0]);
    expect(resultOf("09-inspect")).toMatchObject({ state: "legacy", maintenance: { operation_id: APPLY[0], since: run.since.get("08-apply") } });
  });

  it("11 and 12: chunk 2's committed intent is held from chunk 3's request and finished by its own, whose answer is the intent's", () => {
    expect(refusalOf("11-apply").detail).toContain(APPLY[1]);
    const intentFile = [...(expectedSeeds.get("11-apply") as Map<string, Buffer>).keys()].find((p) => p.endsWith("/intent.json")) as string;
    const intent = JSON.parse(readFileSync(join(SEED, "11-apply", intentFile), "utf-8").split(sincePlaceholder("08-apply")).join(run.since.get("08-apply") as string)) as Intent;
    expect(intent.operation_id).toBe(APPLY[1]);
    expect(intent.created_at).toBe(new Date(CUT_AT).toISOString());
    expect(byName("12-apply").stdout).toBe(JSON.stringify(intent.response) + "\n");
  });

  it("13 and 14: chunk 3, then verify activates: the receipt, then the manifest naming it", () => {
    const v = resultOf("14-verify");
    expect(v).toMatchObject({ operation_id: VERIFY, migration_id: MID, plan: PLAN, receipt: { path: `archive/migrations/${MID}/receipt.json` }, manifest: { path: "workbench.json" } });
    expect(resultOf("23-inspect")).toMatchObject({ state: "json-control", id: WB, manifest: { migration: { id: MID, source_layout: "fusion-v12", receipt: `archive/migrations/${MID}/receipt.json` } }, maintenance: null });
  });

  for (const [repeat, first] of REPEATS) {
    it(`${repeat} repeats ${first}'s request and answers its bytes`, () => {
      expect(byName(repeat).request).toEqual(byName(first).request);
      expect(byName(repeat).stdout).toBe(byName(first).stdout);
    });
  }

  it("18: 07's proposal under a fresh id over the migrated store is the verified second-run no-op, with no later operation yet", () => {
    expect(resultOf("18-plan")).toMatchObject({ operation_id: NO_OP_PLAN, migration_id: MID, no_op: true, later_operations: [] });
  });

  it("20 to 22: list names every converted record; show answers an open package and the terminal plan the paused package binds", () => {
    const records = resultOf("20-list").records as Array<{ id: string; kind: string }>;
    expect(records.map((r) => r.id).sort()).toEqual(SPECS.map((s) => s.id).sort());
    expect(resultOf("21-show")).toMatchObject({ kind: "package", control: { id: ID.P1, status: "open", provenance: { source: "imported" } } });
    expect(resultOf("22-show")).toMatchObject({ kind: "plan", control: { id: ID.C1, control: { state: "closed" }, provenance: { source: "legacy-terminal" } } });
  });

  it("25 to 58: after 18's verified no-op the first rollback after activation is admitted and binds 18 under no_ops; the rest runs to the legacy end, and 18 replays after the cleanup", () => {
    expect(resultOf("25-rollback")).toMatchObject({ chunk: 3, activation_undone: true, binding: { path: ROLLBACK_FILE, sha256: revisionOf(boundA) } });
    const binding = JSON.parse(boundA.toString("utf-8")) as { no_ops: Array<{ operation_id: string; request_digest: string; answer_sha256: string }> };
    expect(binding.no_ops.map((n) => n.operation_id)).toEqual([NO_OP_PLAN]);
    expect(binding.no_ops[0]?.request_digest).toBe(requestDigest(byName("18-plan").request));
    expect(resultOf("26-rollback")).toMatchObject({ chunk: 2, activation_undone: false });
    expect((resultOf("56-rollback").progress as Array<{ chunk: number }>).map((p) => p.chunk)).toEqual([3, 2, 1, 0]);
    expect(resultOf("56-rollback").removed).toContain(ROLLBACK_FILE);
    expect(resultOf("57-maintenance")).toMatchObject({ operation_id: mid(57), action: "end" });
  });

  it("59 to 70, base D: ordinary work then a no-op; the rollback refuses on the activated tree, then, the claimed bytes written back, in the audit naming the work and not the no-op", () => {
    const claimed = parse(byName("65-claim").stdout) as { ok: true; revisions: Record<string, string> };
    expect(Object.keys(claimed.revisions), "the host writes back every file the claim names").toEqual([CLAIMED]);
    expect(resultOf("66-plan")).toMatchObject({ operation_id: NO_OP_D, no_op: true, later_operations: [{ operation_id: mid(64), op: "maintenance" }, { operation_id: WORK, op: "claim" }] });
    expect(refusalOf("68-rollback").detail).toContain("differs from the activated tree");
    expect(refusalOf("68-rollback").detail).toContain(`${CLAIMED} is a file`);
    const audited = refusalOf("69-rollback").detail;
    expect(audited).toContain(`${WORK} (claim)`);
    expect(audited).not.toContain(NO_OP_D);
    expect(audited).not.toContain("activated tree");
    expect(resultOf("70-maintenance")).toMatchObject({ operation_id: mid(70), action: "end" });
  });

  it("35 to 40: the first rollback after activation binds rollback.json, an altered copy is refused, chunk 0 removes it, and 35's replay needs it not", () => {
    const binding = resultOf("35-rollback").binding as { path: string; sha256: string };
    expect(binding.path).toBe(ROLLBACK_FILE);
    expect(resultOf("35-rollback")).toMatchObject({ chunk: 3, activation_undone: true });
    expect(refusalOf("36-rollback").detail).toContain(ROLLBACK_FILE);
    const zero = resultOf("39-rollback");
    expect((zero.removed as string[]).at(-1)).toBe(PLAN.path);
    expect(zero.removed).toContain(ROLLBACK_FILE);
    expect(zero.fence).toBe(mid(34));
    expect((zero.progress as Array<{ chunk: number; operation_id: string }>).map((p) => [p.chunk, p.operation_id])).toEqual([3, 2, 1, 0].map((k) => [k, ROLLBACK[k]]));
  });

  it("41 to 45: after cleanup the legacy end lands, and the store is legacy with no fence", () => {
    expect(resultOf("41-maintenance")).toMatchObject({ operation_id: mid(41), action: "end" });
    expect(resultOf("45-inspect")).toMatchObject({ state: "legacy", manifest: null, maintenance: null, pending: null });
  });

  it("49 to 54: a host write to a file chunk 2 wrote refuses its rollback; restored, the rollback runs down to chunk 0 and the legacy end", () => {
    expect(refusalOf("49-rollback").detail).toContain(C_WRITE);
    expect((resultOf("52-rollback").progress as Array<{ chunk: number }>).map((p) => p.chunk)).toEqual([2, 1, 0]);
    expect(resultOf("54-inspect")).toMatchObject({ state: "legacy", maintenance: null });
  });
});

// --- the recorded session ------------------------------------------------------------------

describe(`the recorded session under fixtures/protocol-session-migration/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
  for (const name of NAMES) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const e = byName(name);
      const requestFile = join(SESSION, `${name}.request.json`);
      const responseFile = join(SESSION, `${name}.response.json`);
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`${FIX} npm test -- round-trip-cli-migration\` in codec/ and commit fixtures/protocol-session-migration/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange; regenerate with ${FIX} only if the protocol changed on purpose`).toBe(recordText(run, e.base, requestBytes(e.request)));
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange; regenerate with ${FIX} only if the protocol changed on purpose`).toBe(recordText(run, e.base, e.stdout));
    });
  }

  it("no recorded byte carries a temp path, and the since placeholders are exactly the seven setters'", () => {
    const seen = new Set<string>();
    for (const name of NAMES) {
      const text = readFileSync(join(SESSION, `${name}.request.json`), "utf-8") + readFileSync(join(SESSION, `${name}.response.json`), "utf-8");
      expect(text, name).not.toContain(tmp);
      for (const m of text.matchAll(/<since:[0-9]{2}-[a-z]+>/g)) seen.add(m[0]);
      expect(readFileSync(join(SESSION, `${name}.request.json`), "utf-8"), name).not.toContain(PLACEHOLDER);
    }
    expect([...seen].sort()).toEqual(SETTERS.map(sincePlaceholder).sort());
    expect(new Set(run.since.values()).size, "seven distinct timestamps of the run").toBe(7);
    for (const v of run.since.values()) expect(Number.isNaN(Date.parse(v)), v).toBe(false);
  });

  for (const name of SEEDED) {
    it(`seed/${name}/ holds exactly the computed bytes`, () => {
      const expected = expectedSeeds.get(name) as Map<string, Buffer>;
      expect(expected, `no seed was computed for ${name}`).toBeDefined();
      const dir = join(SEED, name);
      expect(filesUnder(dir), `seed/${name}/ is not the computed file set; regenerate with ${FIX} only if a producer changed on purpose`).toEqual([...expected.keys()].sort());
      for (const [path, bytes] of expected) expect(bytesAt(dir, path).equals(bytes), `seed/${name}/${path}`).toBe(true);
    });
  }

  it("the recorded set is exactly the seventy pairs, a README and seed/", () => {
    expect(readdirSync(SESSION).sort()).toEqual(["README.md", "seed", ...NAMES.flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort());
    expect(readdirSync(SEED).sort()).toEqual([...SEEDED].sort());
  });

  it("a control file of chunk 2 is where the host writes in base C", () => {
    const writes = cutWrites(2);
    expect(writes).toContain(C_WRITE);
  });

  it("the whole session replays from a shell through bin/fusion-record over roots whose path holds a space and a comma, every answer byte-identical", () => {
    expect(replayRoot).toContain("replay dir, with space");
    expect(replayed.map((r) => r.name)).toEqual([...NAMES]);
    for (const r of replayed) {
      expect(r.status, `${r.name}: ${r.stderr}`).toBe(0);
      expect(r.stdout, r.name).toBe(r.expected);
    }
  });
});

/** The paths chunk `n` of the frozen plan writes, from 07's recorded parts and the seeded proposal's cut. */
function cutWrites(n: number): string[] {
  // Base D's chunk files stand, its rollback refused: read the frozen chunk there.
  const file = join(run.root.d, `archive/migrations/${MID}/chunks/${n}.json`);
  return (JSON.parse(readFileSync(file, "utf-8")) as { writes: Array<{ path: string }> }).writes.map((w) => w.path);
}
