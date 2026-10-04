import { describe, expect, it } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { blocking, buildInventory, composeProposal, FINDINGS, type ComposeInput, type FindingClass, type Proposal, type ProposedRecord } from "../legacy-import.js";
import { REPO_ROOT } from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// The legacy reader and mapping composer over a copy of the legacy fixture
// (`codec/fixtures/legacy-v12/README.md` names every shape and its path). The
// plan step's note records the case red against a composer without the closure.
// ---------------------------------------------------------------------------

const FIX = resolve(REPO_ROOT, "codec", "fixtures", "legacy-v12");
const WP = "work-packages";
const [OPEN, CLAIMED, PAUSED, DONE, DROPPED] = ["260901-0900-tokenizer-handles-unicode", "260902-1000-parser-error-recovery", "260903-1200-streaming-input", "260903-0800-lexer-table-rewrite", "260904-1300-regex-backend"].map((d) => `${WP}/${d}/${d}.md`);
const PLAN = `${WP}/260902-1000-parser-error-recovery/plans/260902-1100_p_plan-parser-error-recovery.md`;
const SPEC = `${WP}/260902-1000-parser-error-recovery/plans/260902-1030_p_spec-parser-error-recovery.md`;
const BOUND = `${WP}/260903-1200-streaming-input/plans/260903-1230_c_plan-streaming-input-first-cut.md`;
const UNTRACKED = "shared/issues/260906-1500_o_parser-panics-on-empty-file.md";
const [BENCH, DEC, ME, GIT] = ["shared/plans/260905-0900_o_plan-benchmark-suite.md", "shared/decisions/260905-1300_a_which-unicode-version-does-the-tokenizer-target.md", "Fixture Person <fixture@example.invalid>", "Git Author <git@example.invalid>"];

/** A copy as the README recreates it: the setup marker, the empty container tree, the untracked issue. */
function withCopy(fn: (wb: string, compose: (o?: Partial<ComposeInput>) => Proposal) => void): void {
  const root = mkdtempSync(join(tmpdir(), "fusion-legacy-"));
  const wb = join(root, "workbench");
  cpSync(join(FIX, "workbench"), wb, { recursive: true, verbatimSymlinks: true });
  writeFileSync(join(wb, ".fusion-setup"), "{}\n");
  for (const s of ["issues", "analyses"]) mkdirSync(join(wb, WP, "260816-0800-fuzzing-harness", s), { recursive: true });
  cpSync(join(FIX, "untracked", UNTRACKED), join(wb, UNTRACKED));
  try {
    fn(wb, (o = {}) => {
      let n = 0;
      return composeProposal({ root: wb, inventory: buildInventory(wb), migrationId: "m1", newId: () => `00000000-0000-4000-8000-${String(n++).padStart(12, "0")}`, firstAdd: (p) => (p === DEC ? { unknown: "untracked" } : { person: GIT, commit: "c0ffee" }), ...o });
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const rec = (p: Proposal, path: string) => p.records.find((r) => r.narrative === path)!;
const ctl = (p: Proposal, path: string) => rec(p, path)?.control as Record<string, any>;
const classes = (p: Proposal, severity: string) => [...new Set(p.findings.filter((f) => f.severity === severity).map((f) => f.class))].sort();

describe("legacy import: the record cut over every legacy shape", () => {
  it("counts each cut row and writes nothing", () =>
    withCopy((wb, compose) => {
      const before = JSON.stringify(buildInventory(wb));
      const p = compose({ untracked: [UNTRACKED] });
      expect(JSON.stringify(buildInventory(wb))).toBe(before);
      expect(JSON.stringify(compose({ untracked: [UNTRACKED] }))).toBe(JSON.stringify(p));
      expect(p.counts).toEqual({ "package-live": 3, "package-terminal": 6, "record-live": 11, "record-closure": 1, "plain-terminal": 10, "empty-container": 1 });
      expect(classes(p, "blocking")).toEqual([]);
      expect(classes(p, "reported")).toEqual(["answer-ref-self", "circle-deferred", "circle-head-disagrees-with-marker", "duplicate-step-number", "empty-container-tree", "filed-by-not-owed", "live-record-in-terminal-container", "symlink", "terminal-value-without-v1-state", "untracked-record"]);
    }));

  it("maps item records, Circle heads and the empty tree", () =>
    withCopy((_, compose) => {
      const p = compose();
      const status = (path: string) => [ctl(p, path).status, ctl(p, path).outcome?.class ?? null, ctl(p, path).provenance.source];
      expect([OPEN, CLAIMED, PAUSED, DONE, DROPPED].map(status)).toEqual([["open", null, "imported"], ["claimed", null, "imported"], ["paused", null, "imported"], ["done", "legacy-completed", "legacy-terminal"], ["dropped", "dropped", "legacy-terminal"]]);
      expect(["_c_", "_b_", "_s_", "_d_"].map((m) => status(p.records.find((r) => r.narrative.endsWith(`${m}circle.md`))!.narrative))).toEqual([["done", "legacy-completed", "legacy-terminal"], ["dropped", "bounded", "legacy-terminal"], ["dropped", "dropped", "legacy-terminal"], ["dropped", "dropped", "legacy-terminal"]]);
      expect(ctl(p, CLAIMED)).toMatchObject({ claim: { checkout_id: "0f1e2d3c", person: "Fixture Person <fixture@example.invalid>", claimed_at: null }, mode: { value: "autonomous", source: { kind: "legacy" } }, origin: { kind: "user-request" } });
      expect(rec(p, CLAIMED).narrative_after).not.toMatch(/\*\*(Status|Claim|Mode|Active spec\/plan):\*\*/);
      expect([rec(p, DONE).narrative_after, ctl(p, DONE).provenance.backup.path]).toEqual([null, `archive/migrations/m1/originals/${DONE}`]);
    }));

  it("binds dependencies and documents, and the closure pulls exactly the bound terminal plan", () =>
    withCopy((_, compose) => {
      const p = compose();
      const id = (path: string) => rec(p, path).id;
      expect(ctl(p, OPEN).depends_on).toEqual([{ target: expect.objectContaining({ record_id: id(DONE) }), condition: "terminal" }]);
      expect(ctl(p, PAUSED).depends_on[0].target.record_id).toBe(id(OPEN));
      expect(ctl(p, CLAIMED).active_documents.map((d: any) => [d.ref.record_id, d.role])).toEqual([[id(SPEC), "spec"], [id(PLAN), "plan"]]);
      expect(ctl(p, CLAIMED).active_documents[1].revision).toMatch(/^sha256:/);
      expect(ctl(p, PLAN).control.acceptance.ref.record_id).toBe(id(CLAIMED));
      expect(p.records.filter((r) => r.row === "record-closure").map((r) => [r.narrative, r.control.provenance])).toEqual([[BOUND, expect.objectContaining({ source: "legacy-terminal" })]]);
      expect([ctl(p, DONE).active_documents, ctl(p, DROPPED).active_documents, ctl(p, DONE).depends_on]).toEqual([[], [], []]);
      expect(p.findings.filter((f) => f.class === "closure-incomplete")).toEqual([]);
    }));

  it("reads plan steps, decision lines and live records of every kind", () =>
    withCopy((_, compose) => {
      const p = compose();
      expect(ctl(p, PLAN).control.steps).toEqual([{ id: "1", state: "done" }, { id: "2", state: "in_progress" }, { id: "12a", state: "open" }, { id: "12b", state: "open" }]);
      expect(rec(p, PLAN).narrative_after).not.toMatch(/\[(DONE|IN PROGRESS|OPEN)\]|\*\*Status:\*\*/);
      expect([ctl(p, SPEC).control.steps, rec(p, SPEC).narrative_after!.includes("**Status:**")]).toEqual([[], false]);
      expect(p.findings.find((f) => f.class === "duplicate-step-number")!.path).toBe("shared/plans/260905-0900_o_plan-benchmark-suite.md");
      const answered = p.records.filter((r) => r.kind === "decision" && r.control.control.state === "answered").map((r) => r.control.control.answer_ref);
      expect(answered).toEqual([{ path: "archive/migrations/m1/originals/shared/decisions/260905-1300_a_which-unicode-version-does-the-tokenizer-target.md", sha256: expect.any(String), kind: "decision" }, expect.objectContaining({ record_id: rec(p, PLAN).id })]);
      const live = p.records.filter((r) => r.row === "record-live").map((r) => `${r.kind}:${r.control.control.state}`).sort();
      expect(live).toEqual(["decision:answered", "decision:answered", "decision:open", "discussion:open", "issue:in_progress", "issue:open", "issue:open", "issue:open", "plan:in_progress", "plan:in_progress", "plan:open"]);
      expect(p.records.some((r) => r.kind !== "package" && /_[cdis]_/.test(r.narrative) && r.narrative !== BOUND)).toBe(false);
    }));
});

describe("legacy import: what blocks activation", () => {
  it("blocks each case of spec section 8.2 rather than guessing it", () =>
    withCopy((wb, compose) => {
      const edit = (rel: string, a: string, b: string) => writeFileSync(join(wb, rel), readFileSync(join(wb, rel), "utf-8").replace(a, b));
      edit(OPEN, "**Status:** open", "**Status:** claimed");
      edit(PAUSED, "(plan, closed before the pause)", "(plan), 260902-1100_*_plan-parser-error-recovery.md (plan)");
      edit(PAUSED, "**Depends-on:** 260901-0900-tokenizer-handles-unicode.md", "**Depends-on:** 260999-0000-no-such-package.md");
      renameSync(join(wb, "shared/decisions/260905-1200_o_should-the-ast-keep-trivia.md"), join(wb, "shared/decisions/260905-1200_x_should-the-ast-keep-trivia.md"));
      const b = blocking(compose()).map((f) => `${f.class} ${f.path}`);
      // Two live packages binding one plan as their active plan is ruling b1's genuine question, as one package binding two is.
      expect(b).toEqual(expect.arrayContaining([`invalid-claim ${OPEN}`, `several-active-plans ${PAUSED}`, `plan-adopted-twice ${PLAN}`, `unresolvable-live-dependency ${PAUSED}`, "unknown-state shared/decisions/260905-1200_x_should-the-ast-keep-trivia.md"]));
      expect(Object.keys(FINDINGS).filter((k) => FINDINGS[k as FindingClass] === "blocking")).toEqual(["legacy-store-name", "manifest-present", "control-file-exists", "unknown-state", "unknown-package-status", "two-package-heads", "container-without-head", "invalid-claim", "unknown-mode", "duplicate-control-head", "several-active-plans", "plan-adopted-twice", "unresolvable-live-dependency", "dependency-not-a-package", "dependency-archived", "ambiguous-structural-citation", "closure-without-v1-state", "closure-incomplete", "record-is-link", "narrative-too-large"]);
    }));

  it("refuses the v11-named twin with the route to the store rename", () =>
    withCopy((wb, compose) => {
      renameSync(join(wb, WP), join(wb, "circles"));
      expect(blocking(compose()).filter((f) => f.class === "legacy-store-name").map((f) => f.path)).toEqual(["circles"]);
    }));
});

// Each class the ruling of 2026-10-03 reclassified, on a copy edited to raise it: its control value, its derived entry, and nothing blocking.
const SPEC_AT = "260902-1030_*_spec-parser-error-recovery.md (the spec)";
const DCIRCLE = `${WP}/260815-1400-wasm-target/_d_circle.md`;
const D = (c: Record<string, any>) => c.provenance.legacy_fields.derived;
type Row = [FindingClass, (wb: string) => void, string, (c: Record<string, any>, r: ProposedRecord) => unknown, unknown];
const carried = (evidence: string, token: string): [Row[3], unknown] => [(c) => [c.references.at(-1), D(c)[`/references/${c.references.length - 1}`], c.active_documents.length], [token, { rule: "binding-carried-as-reference", evidence }, 1]];
const ROWS: Row[] = [
  ["filed-by-not-owed", () => {}, PLAN, (c) => [c.filed_by, D(c)["/filed_by/actor"], D(c)["/filed_by/person"]], [{ actor: "legacy-unknown", person: GIT }, { rule: "unknown" }, { rule: "git-first-add", evidence: "c0ffee" }]],
  ["filed-by-missing", (wb) => edit(wb, DEC, `**Filed by:** implementation-planner, ${ME}\n`, ""), DEC, (c) => [c.filed_by, D(c)["/filed_by/person"]], [{ actor: "legacy-unknown", person: null }, { rule: "unknown", evidence: "untracked" }]],
  ["filed-by-unreadable", (wb) => edit(wb, DEC, "implementation-planner,", "The Planner,"), DEC, (c) => [c.filed_by.actor, c.provenance.legacy_fields.head["Filed by"]], ["legacy-unknown", `The Planner, ${ME}`]],
  ["answered-without-answer-line", (wb) => edit(wb, DEC, "\nAnswered:", "\nNote:"), DEC, (c) => [c.control.answer_ref.path, D(c)["/control/answer_ref"]], [`archive/migrations/m1/originals/${DEC}`, { rule: "answer-ref-self", evidence: "no-answer-line" }]],
  ["answered-without-answer-line", (wb) => edit(wb, DEC, /\nAnswered:.*\n?$/, "\nAnswered:\n"), DEC, (c) => D(c)["/control/answer_ref"], { rule: "answer-ref-self", evidence: "empty-answer-line" }],
  ["answer-ref-self", () => {}, DEC, (c) => [c.control.answer_ref.path, D(c)["/control/answer_ref"]], [`archive/migrations/m1/originals/${DEC}`, { rule: "answer-ref-self", evidence: "unresolvable-answer-line" }]],
  ["mark-outside-numbered-step", (wb) => edit(wb, BENCH, "## Where", "### [DONE] Benchmarks run in CI\n\n## Where"), BENCH, (c, r) => [c.provenance.legacy_fields.unanchored_marks, r.narrative_after!.includes("\n### Benchmarks run in CI\n")], [{ "line 21": "DONE" }, true]],
  ["unknown-step-mark", (wb) => edit(wb, PLAN, "12a. [OPEN]", "12a. [BLOCKED]"), PLAN, (c) => [c.control.steps[2], D(c)["/control/steps/2/state"], c.provenance.legacy_fields.step_marks["12a"]], [{ id: "12a", state: "open" }, { rule: "unrecognised-mark-open", evidence: "BLOCKED" }, "BLOCKED"]],
  ["duplicate-step-number", () => {}, BENCH, (c) => [c.control.steps, D(c)["/control/steps"]], [[{ id: "1", state: "open" }], { rule: "duplicate-numbers-unanchored", evidence: "2" }]],
  ["unresolvable-active-document", (wb) => edit(wb, CLAIMED, SPEC_AT, "260902-1031_*_spec-gone.md (the spec)"), CLAIMED, ...carried("unresolvable", "260902-1031_*_spec-gone.md")],
  ["active-document-archived", (wb) => edit(wb, CLAIMED, SPEC_AT, "260805-1000_*_readme-typo.md (the spec)"), CLAIMED, ...carried("archived", "260805-1000_*_readme-typo.md")],
  ["active-document-ambiguous", (wb) => writeFileSync(join(wb, "shared/plans/260902-1030_o_spec-parser-error-recovery.md"), "# A second spec\n"), CLAIMED, ...carried("ambiguous", "260902-1030_*_spec-parser-error-recovery.md")],
  ["active-document-not-a-plan", (wb) => edit(wb, CLAIMED, SPEC_AT, "260902-1400_*_recovery-loses-token-position.md (the spec)"), CLAIMED, ...carried("not-a-plan", "260902-1400_*_recovery-loses-token-position.md")],
  ["active-document-role-unclear", (wb) => (renameSync(join(wb, SPEC), join(wb, SPEC.replace("spec-parser-error-recovery", "recovery-notes"))), edit(wb, CLAIMED, SPEC_AT, "260902-1030_*_recovery-notes.md (the notes)")), CLAIMED, ...carried("role-unclear", "260902-1030_*_recovery-notes.md")],
  ["active-document-role-conflict", (wb) => edit(wb, CLAIMED, "(plan, part 1 of 2)", "(the spec)"), CLAIMED, ...carried("role-conflict", "260902-1100_*_plan-parser-error-recovery.md")],
  ["circle-deferred", () => {}, DCIRCLE, (c) => [c.status, c.outcome, D(c)["/status"]], ["dropped", { class: "dropped", reason: "deferred (legacy Circle marker)", evidence: [] }, { rule: "circle-deferred-dropped" }]],
];
const edit = (wb: string, rel: string, a: string | RegExp, b: string) => writeFileSync(join(wb, rel), readFileSync(join(wb, rel), "utf-8").replace(a, b));

describe("legacy import: derive, carry as unknown, default", () => {
  it.each(ROWS)("%s: the value is derived or defaulted, marked as such, and blocks nothing", (cls, setup, path, pick, expected) =>
    withCopy((wb, compose) => {
      setup(wb);
      const p = compose();
      expect([blocking(p), p.findings.some((f) => f.class === cls && f.severity === "reported"), pick(ctl(p, path), rec(p, path))]).toEqual([[], true, expected]);
    }),
  );

  it("keeps a recorded value: an explicit **Filed by:** user has no person and no derived entry", () =>
    withCopy((wb, compose) => {
      edit(wb, DEC, `implementation-planner, ${ME}`, "user");
      const c = ctl(compose({ firstAdd: () => ({ person: GIT, commit: "c0ffee" }) }), DEC);
      // The one derived entry is the decision's answer_ref default; none is the filer's.
      expect([c.filed_by, Object.keys(D(c))]).toEqual([{ actor: "user", person: null }, ["/control/answer_ref"]]);
    }));
});
