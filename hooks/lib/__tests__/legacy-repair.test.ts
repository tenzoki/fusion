import { describe, expect, it } from "vitest";
import { cpSync, existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildInventory, composeProposal, type Finding, type FindingClass } from "../legacy-import.js";
import { actorsFromLog, applyRepair, proposeRepair, readRepairLog, treeHash, type RepairProposal } from "../legacy-repair.js";
import { REPO_ROOT } from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// The consented repair of blocking findings, over a copy of the legacy fixture
// (`codec/fixtures/legacy-v12/README.md`). Every answer is the test's; the plan
// step's note records each guard red against a copy that writes without consent
// and one that takes the offered person when none was answered.
// ---------------------------------------------------------------------------

const FIX = resolve(REPO_ROOT, "codec", "fixtures", "legacy-v12", "workbench");
const ME = "Fixture Person <fixture@example.invalid>";
const PKG = "work-packages/260902-1000-parser-error-recovery";
const CLAIMED = `${PKG}/260902-1000-parser-error-recovery.md`;
const PLAN = `${PKG}/plans/260902-1100_p_plan-parser-error-recovery.md`;
const BENCH = "shared/plans/260905-0900_o_plan-benchmark-suite.md";
const DEC = "shared/decisions/260905-1300_a_which-unicode-version-does-the-tokenizer-target.md";
const SPEC = "260902-1030_*_spec-parser-error-recovery.md (the spec)";

function withCopy(fn: (wb: string, session: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "fusion-repair-"));
  cpSync(FIX, join(root, "wb"), { recursive: true, verbatimSymlinks: true });
  writeFileSync(join(root, "wb", ".fusion-setup"), "{}\n");
  try {
    fn(join(root, "wb"), join(root, "session"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const edit = (wb: string, rel: string, a: string, b: string) => writeFileSync(join(wb, rel), readFileSync(join(wb, rel), "utf-8").replace(a, b));
const findings = (wb: string, session = "") => composeProposal({ root: wb, inventory: buildInventory(wb), migrationId: "t", newId: () => "x", actors: actorsFromLog(readRepairLog(session)) }).findings;
const blockers = (wb: string, session = "") => findings(wb, session).filter((f) => f.severity === "blocking");
const same = (wb: string, f: Finding) => findings(wb).filter((x) => x.class === f.class && x.path === f.path && x.detail === f.detail).length;
const asked = (p: RepairProposal, a: Record<string, string>) => (p.repairable ? p.questions.filter((q) => !q.when || a[q.when.key] === q.when.value) : []);

const CASES: [FindingClass, (wb: string) => void, Record<string, string>][] = [
  ["filed-by-missing", (wb) => edit(wb, DEC, `**Filed by:** implementation-planner, ${ME}\n`, ""), { actor: "implementation-planner", person: "" }],
  ["filed-by-not-owed", () => {}, { actor: "user", person: ME }],
  ["filed-by-unreadable", (wb) => edit(wb, DEC, "**Filed by:** implementation-planner", "**Filed by:** The Planner"), { actor: "implementation-planner", person: ME }],
  ["answered-without-answer-line", (wb) => edit(wb, DEC, "\nAnswered:", "\nNote:"), { section: "## Recommendation", summary: "option 2", ruler: "user", ruler_person: ME }],
  ["mark-outside-numbered-step", (wb) => edit(wb, BENCH, "## Where", "### [DONE] Benchmarks run in CI\n\n## Where"), { action: "move", step: "1" }],
  ["unknown-step-mark", (wb) => edit(wb, PLAN, "12a. [OPEN]", "12a. [BLOCKED]"), { mark: "OPEN" }],
  ["duplicate-step-number", () => {}, {}],
  ["unresolvable-active-document", (wb) => edit(wb, CLAIMED, SPEC, "260902-1031_*_spec-gone.md (the spec)"), { action: "cross-reference" }],
  ["active-document-role-unclear", (wb) => (renameSync(join(wb, PKG, "plans/260902-1030_p_spec-parser-error-recovery.md"), join(wb, PKG, "plans/260902-1030_p_recovery-notes.md")), edit(wb, CLAIMED, SPEC, "260902-1030_*_recovery-notes.md (the notes)")), { role: "spec" }],
  ["circle-deferred", () => {}, { status: "paused" }],
];
const ANSWERS = Object.fromEntries(CASES.map(([c, , a]) => [c, a]));

describe("legacy repair: one blocking finding at a time, with consent", () => {
  it.each(CASES)("%s: repaired only with consent and every asked value, then gone from the reader", (cls, setup, answers) =>
    withCopy((wb, session) => {
      setup(wb);
      const f = blockers(wb).find((x) => x.class === cls)!;
      const p = proposeRepair(wb, f, { person: ME });
      const before = [treeHash(wb), same(wb, f)] as const;
      expect([p.repairable, asked(p, answers).map((q) => q.key).sort()]).toEqual([true, Object.keys(answers).sort()]);
      expect(applyRepair({ root: wb, session, proposal: p, consent: false, answers })).toMatchObject({ applied: false, refusal: "no-consent" });
      for (const q of asked(p, answers)) {
        const { [q.key]: _, ...rest } = answers;
        expect(applyRepair({ root: wb, session, proposal: p, consent: true, answers: rest })).toMatchObject({ applied: false, refusal: "unanswered" });
      }
      expect([treeHash(wb), existsSync(session)]).toEqual([before[0], false]);
      expect(applyRepair({ root: wb, session, proposal: p, consent: true, answers })).toMatchObject({ applied: true });
      expect(same(wb, f)).toBeLessThan(before[1]);
      expect(readRepairLog(session).map((e) => e.finding)).toEqual([f]);
    }),
  );

  it("refuses a class with no repair, routes the old store names, and refuses a file changed after the finding", () =>
    withCopy((wb, session) => {
      edit(wb, "work-packages/260901-0900-tokenizer-handles-unicode/260901-0900-tokenizer-handles-unicode.md", "**Status:** open", "**Status:** claimed");
      const claim = proposeRepair(wb, blockers(wb).find((x) => x.class === "invalid-claim")!);
      expect(applyRepair({ root: wb, session, proposal: claim, consent: true, answers: {} })).toMatchObject({ applied: false, refusal: "unrepairable" });
      const dup = proposeRepair(wb, findings(wb).find((x) => x.class === "duplicate-step-number")!);
      expect(dup).toMatchObject({ repairable: true, questions: [] });
      expect(applyRepair({ root: wb, session: join(wb, "s"), proposal: dup, consent: true, answers: {} })).toMatchObject({ refusal: "session-inside-root" });
      edit(wb, BENCH, "## Where", "## Where, edited");
      const after = treeHash(wb);
      expect(applyRepair({ root: wb, session, proposal: dup, consent: true, answers: {} })).toMatchObject({ applied: false, refusal: "file-changed" });
      expect([treeHash(wb), existsSync(session)]).toEqual([after, false]);
      renameSync(join(wb, "work-packages"), join(wb, "circles"));
      const route = proposeRepair(wb, findings(wb).find((x) => x.class === "legacy-store-name")!);
      expect(route).toMatchObject({ repairable: false, reason: expect.stringContaining("/fusion:migrate") });
    }));

  it("repairs the fixture to zero blocking findings, backed up first and logged with hashes", () =>
    withCopy((wb, session) => {
      const original = treeHash(wb);
      for (let left = blockers(wb), n = 0; left.length; left = blockers(wb, session), n++) {
        expect(n).toBeLessThan(10);
        expect(applyRepair({ root: wb, session, proposal: proposeRepair(wb, left[0]), consent: true, answers: ANSWERS[left[0].class] })).toMatchObject({ applied: true });
      }
      const log = readRepairLog(session);
      expect(log.map((e) => e.finding.class).sort()).toEqual(["circle-deferred", "duplicate-step-number", "filed-by-not-owed", "filed-by-not-owed", "filed-by-not-owed", "filed-by-not-owed"]);
      expect(log.map((e) => /^sha256:/.test(e.pre_sha256) && (e.pre_sha256 === e.post_sha256) === (e.control_only === true))).toEqual(log.map(() => true));
      expect([readFileSync(join(session, "backup.sha256"), "utf-8").trim(), treeHash(join(session, "backup"))]).toEqual([original, original]);
    }));
});
