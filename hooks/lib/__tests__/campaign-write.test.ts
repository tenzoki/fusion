import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LIVE_STATES, type CampaignAtRef, type CampaignLane } from "../campaign.js";
import { mineOf } from "../campaign-sync.js";
import { PLACEHOLDER_HASH, readProposal, TERMINAL_STATES } from "../campaign-write.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { campaignFile, claim, createPackage, must, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-campaign` writes over workbenches the kernel wrote (`helpers/json-workbench.ts`), the
// way `fusion-claimed-package.test.ts` drives its script: every path physical, the codec reached through this tree's
// bundle. Under test is the contract of plan step 16b: after every write the stored `state.charter_hash` and
// `state.revision` equal the `prior` the codec answers on `show`, every written file validates, `pause` moves
// `state.revision` and `move` moves neither value while the file's own revision moves, a claim held by the running
// checkout refuses every write with exit 8 and a lane rule broken refuses with exit 9, nothing written either way.
// And the one reading of a live campaign (`LIVE_STATES`, `running` or `paused`): a `draft` campaign beside a running
// one is not what a write without `--campaign` names, exactly as `sync`'s `mineOf` does not count it.
//
// HOME is a directory of its own, because `bin/fusion-tmp` puts the scratch workbench under it.

const script = join(pluginRoot, "bin", "fusion-campaign");
const identity = join(pluginRoot, "bin", "fusion-identity");
const ID = "261109-2300-pipeline";
const REL = `campaigns/${ID}/campaign.json`;
const [A, B] = ["a1a1a1a1", "b2b2b2b2"];
const home = realpathSync(mkdtempSync(join(tmpdir(), "fusion-campaign-write-home-")));
afterAll(() => rmSync(home, { recursive: true, force: true }));

/** All three git config layers are cut off, so the identity under test is the fixture's. */
const env = { ...process.env, HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
const sh = (cmd: string, args: string[], cwd: string) =>
  ((r) => ({ status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" }))(spawnSync(cmd, args, { cwd, env, encoding: "utf-8" }));
const run = (p: JsonProject, ...args: string[]) => {
  const r = sh(script, args, p.root);
  const value = (key: string): string | null => r.stdout.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1) ?? null;
  return { ...r, value };
};
const sha = (p: JsonProject): string => `sha256:${createHash("sha256").update(readFileSync(join(p.workbench, REL))).digest("hex")}`;
/** No `campaign-*` scratch directory survives a run. */
const scratchGone = (): string[] => (existsSync(join(home, ".fusion-tmp")) ? readdirSync(join(home, ".fusion-tmp")).flatMap((id) => readdirSync(join(home, ".fusion-tmp", id)).filter((n) => n.startsWith("campaign-"))) : []);

interface Stored {
  control: Record<string, unknown>;
  state: Record<string, unknown>;
  lanes: Array<{ id: string; checkout_id: string | null; members: Array<{ record_id: string; display: string }> }> | null;
  revision: string;
}
/** The campaign as the codec reads it back, after asserting that it validates and that its two stored values are the `prior` the codec computes. */
function stored(p: JsonProject): Stored {
  const checked = must(p, { op: "validate", record: { path: REL } }).result;
  expect([checked.valid, checked.findings]).toEqual([true, []]);
  const shown = must(p, { op: "show", record: { path: REL } }).result;
  const control = shown.control as Record<string, unknown>;
  const state = control.state as Record<string, unknown>;
  expect(shown.prior).toEqual({ charter_hash: state.charter_hash, revision: state.revision });
  expect(state.charter_hash).not.toBe(PLACEHOLDER_HASH);
  expect(shown.revision).toBe(sha(p));
  return { control, state, lanes: control.lanes as Stored["lanes"], revision: shown.revision as string };
}
/** A write that must land: exit 0, `path=` and `revision=` naming the file as written. */
function landed(p: JsonProject, ...args: string[]): Stored {
  const r = run(p, ...args);
  expect(r.status, r.stderr).toBe(0);
  expect([r.value("path"), r.value("revision")]).toEqual([REL, sha(p)]);
  expect(scratchGone()).toEqual([]);
  return stored(p);
}
/** A write that must be refused by exit 9, with the file's bytes as before. */
function refused(p: JsonProject, reason: string, ...args: string[]): void {
  const before = sha(p);
  const r = run(p, ...args);
  expect([r.status, r.value("state"), r.value("refused")], r.stderr).toEqual([9, "refused", reason]);
  expect([sha(p), scratchGone()]).toEqual([before, []]);
}
const proposal = (p: JsonProject, name: string, lanes: Array<{ id: string; members: string[] }>): string => {
  const path = join(p.root, name);
  writeFileSync(path, JSON.stringify({ checkouts: lanes.length, tolerance: 1, lanes, handoffs: [], no_areas: [], imbalance: [] }, null, 2));
  return path;
};
const stems = ["261101-0001-strict-reader", "261101-0002-parser-fix", "261101-0003-the-third"];

describe("bin/fusion-campaign, the steering writes", () => {
  it("open, lanes, pause, resume, move, reassign and end: each stores the two values show answers as prior and validates", () => {
    withJsonProject((p) => {
      const packages = stems.map((s) => createPackage(p, s));
      const ids = packages.map((x) => x.id);

      // open: request 80's charter values, running with nothing started, every other member null or at zero.
      const opened = landed(p, "open", "--id", ID, "--objective", "Work the pipeline in two lanes.", "--authorisation", "261108-1924-campaign.md", "--stop", "the user says stop", "--stop", "the intake closes");
      expect(opened.control.charter).toMatchObject({ campaign_id: ID, revision: "prior-opaque:r1", authorisation_ref: "261108-1924-campaign.md", objective: "Work the pipeline in two lanes.", stop_conditions: ["the user says stop", "the intake closes"], delivery_policy: "commit, then pull with rebase, then read the campaign, then push", item_kinds: ["work-package"], budget_account: "none", limits: { max_attempts: 1, max_failures: 0, max_consecutive_failures: 1, max_reviews: 1, resource_units: 1 } });
      expect(opened.state).toMatchObject({ campaign_id: ID, state: "running", reason: null, previous_terminal: null, requested_outcome: null, sessions: [], runs: [], baseline_hash: null, completion_evidence: null, counters: { attempts: 0, failures: 0, consecutive_failures: 0, reviews: 0, resource_units: 0 } });
      expect([opened.lanes, opened.control.register, opened.control.formation, opened.control.provenance]).toEqual([null, null, null, { source: "created", legacy_fields: {} }]);
      expect(opened.control.workbench_id).toBe(must(p, { op: "inspect" }).result.id);
      refused(p, "conflict/campaign-exists", "open", "--id", ID, "--objective", "again", "--authorisation", "x");

      // lanes: members resolved to record refs, one lane assigned; the two values are what open stored, the file's revision moves.
      const laned = landed(p, "lanes", "--from", proposal(p, "cut.json", [{ id: "lane-1", members: [stems[0], stems[1]] }, { id: "lane-2", members: [stems[2]] }]), "--assign", `lane-1=${A}`);
      expect(laned.lanes).toEqual([
        { id: "lane-1", checkout_id: A, members: [{ workbench_id: opened.control.workbench_id, record_id: ids[0], display: stems[0] }, { workbench_id: opened.control.workbench_id, record_id: ids[1], display: stems[1] }] },
        { id: "lane-2", checkout_id: null, members: [{ workbench_id: opened.control.workbench_id, record_id: ids[2], display: stems[2] }] },
      ]);
      expect([laned.state.charter_hash, laned.state.revision, laned.revision === opened.revision]).toEqual([opened.state.charter_hash, opened.state.revision, false]);

      // pause moves state.revision and not charter_hash; resume writes running and reason null.
      const paused = landed(p, "pause", "--reason", "the parser schema is being decided");
      expect([paused.state.state, paused.state.reason, paused.state.charter_hash, paused.state.revision === laned.state.revision]).toEqual(["paused", "the parser schema is being decided", laned.state.charter_hash, false]);
      refused(p, "conflict/campaign-not-running", "pause", "--reason", "twice");
      const resumed = landed(p, "resume");
      expect([resumed.state.state, resumed.state.reason, resumed.state.revision]).toEqual(["running", null, laned.state.revision]);
      refused(p, "conflict/campaign-not-paused", "resume");

      // move and reassign edit the lanes and move neither value; the file's revision moves.
      const moved = landed(p, "move", stems[1], "--to", "lane-2");
      expect(moved.lanes?.map((l) => l.members.map((m) => m.display))).toEqual([[stems[0]], [stems[2], stems[1]]]);
      expect([moved.state.charter_hash, moved.state.revision, moved.revision === resumed.revision]).toEqual([resumed.state.charter_hash, resumed.state.revision, false]);
      refused(p, "conflict/package-already-in-lane", "move", stems[1], "--to", "lane-2");
      refused(p, "unknown-scope/lane-unknown", "move", stems[1], "--to", "lane-9");
      refused(p, "unknown-scope/package-unknown", "move", "261101-0009-nowhere", "--to", "lane-1");
      const reassigned = landed(p, "reassign", "lane-2", "--checkout", B);
      expect(reassigned.lanes?.map((l) => l.checkout_id)).toEqual([A, B]);
      // The third lane rule, decided by the codec's validate and not by this helper: one checkout in two lanes.
      refused(p, "schema-invalid/duplicate-lane-checkout", "reassign", "lane-2", "--checkout", A);
      // A package in two lanes, the same way.
      refused(p, "schema-invalid/duplicate-lane-member", "lanes", "--from", proposal(p, "twice.json", [{ id: "lane-1", members: [stems[0]] }, { id: "lane-2", members: [stems[0]] }]));
      refused(p, "unknown-scope/lane-unknown", "lanes", "--from", proposal(p, "cut.json", [{ id: "lane-1", members: [] }]), "--assign", `lane-3=${A}`);
      writeFileSync(join(p.root, "bad.json"), "{\"lanes\": [{\"id\": 1}]}");
      refused(p, "schema-invalid/proposal-unreadable", "lanes", "--from", join(p.root, "bad.json"));

      // end: completed carries the evidence as stated; a terminal campaign takes no further act.
      const ended = landed(p, "end", "--outcome", "completed", "--objective-met", "--final-audit-passed", "--reason", "every lane is done");
      expect([ended.state.state, ended.state.reason, ended.state.completion_evidence]).toEqual(["completed", "every lane is done", { objective_met: true, intake_closed: false, all_attempts_terminal: false, final_audit_passed: true, watermark: null, audit_ref: null }]);
      expect(ended.state.revision === reassigned.state.revision).toBe(false);
      refused(p, "conflict/campaign-terminal", "pause", "--reason", "too late", "--campaign", ID);
      // And without --campaign there is no live campaign left to name.
      refused(p, "unknown-scope/no-campaign", "resume");
      expect(TERMINAL_STATES.has("completed")).toBe(true);
    });
  }, CASE_TIMEOUT * 6);

  it("end on a non-completed outcome writes no evidence, and --campaign names one of several", () => {
    withJsonProject((p) => {
      landed(p, "open", "--id", ID, "--objective", "o", "--authorisation", "a");
      const second = "261109-2301-second";
      const r = run(p, "open", "--id", second, "--objective", "o", "--authorisation", "a");
      expect(r.status, r.stderr).toBe(0);
      refused(p, "unknown-scope/several-campaigns", "pause", "--reason", "which one");
      refused(p, "unknown-scope/no-campaign", "pause", "--reason", "x", "--campaign", "261109-2302-nowhere");
      const ended = landed(p, "end", "--outcome", "cancelled", "--campaign", ID);
      expect([ended.state.state, ended.state.reason, ended.state.completion_evidence]).toEqual(["cancelled", null, null]);
      // With one campaign terminal, the other is again the one live campaign.
      const paused = run(p, "pause", "--reason", "now unambiguous");
      expect([paused.status, paused.value("path")], paused.stderr).toEqual([0, `campaigns/${second}/campaign.json`]);
    });
  }, CASE_TIMEOUT * 4);

  it("a draft campaign beside a running one: a write without --campaign names the running one, as sync counts it; the draft is named with the flag", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, stems[0]);
      const draft = "261109-2302-drafted";
      const draftRel = `campaigns/${draft}/campaign.json`;
      const draftBytes = (): string => readFileSync(join(p.workbench, draftRel), "utf-8");
      landed(p, "open", "--id", ID, "--objective", "o", "--authorisation", "a");
      campaignFile(p, draft);
      // Two campaigns listed, one live: the draft is not counted, so no --campaign is needed.
      for (const act of [["pause", "--reason", "the draft does not count"], ["resume"]]) {
        const r = run(p, ...act);
        expect([r.status, r.value("path")], r.stderr).toEqual([0, REL]);
      }
      // Named, the draft takes lanes, a campaign prepared before it runs; it cannot end, not being live.
      const laned = run(p, "lanes", "--from", proposal(p, "draft.json", [{ id: "lane-1", members: [stems[0]] }]), "--assign", `lane-1=${A}`, "--campaign", draft);
      expect([laned.status, laned.value("path")], laned.stderr).toEqual([0, draftRel]);
      const before = draftBytes();
      refused(p, "conflict/campaign-not-live", "end", "--outcome", "cancelled", "--campaign", draft);
      expect(draftBytes()).toBe(before);
      // What sync counts, by the same set: the running campaign without lanes is mine, the draft whose lane names this checkout is not.
      const at = (id: string, state: string, lanes: CampaignLane[] | null): CampaignAtRef => ({ id, state, revision: "sha256:0", reason: null, lanes });
      const both = [at(ID, "running", null), at(draft, "draft", [{ id: "lane-1", checkout: A, members: [pkg.id] }])];
      expect(mineOf(both, A)).toEqual({ mine: both[0], note: null });
      expect([...LIVE_STATES].sort()).toEqual(["paused", "running"]);
      // With the running one ended, the draft alone is no live campaign for the default to name.
      landed(p, "end", "--outcome", "cancelled");
      refused(p, "unknown-scope/no-campaign", "pause", "--reason", "x");
    });
  }, CASE_TIMEOUT * 4);

  it("a claim held by the running checkout refuses every write with exit 8 and writes nothing", () => {
    withJsonProject((p) => {
      for (const a of [["init", "-q"], ["config", "user.email", "scratch@example.com"], ["config", "user.name", "Scratch Person"]]) sh("git", a, p.root);
      const me = /^CHECKOUT=(.*)$/m.exec(sh(identity, [], p.root).stdout)?.[1] as string;
      claim(p, createPackage(p, stems[0]), me);
      const acts = [["open", "--id", ID, "--objective", "o", "--authorisation", "a"], ["lanes", "--from", "x.json"], ["pause", "--reason", "r"], ["resume"], ["move", stems[0], "--to", "lane-1"], ["reassign", "lane-1", "--checkout", A], ["end", "--outcome", "failed"]];
      for (const act of acts) {
        const r = run(p, ...act);
        expect([r.status, r.value("state"), r.value("held")], act.join(" ")).toEqual([8, "holds-package", `this checkout holds work-packages/${stems[0]}/${stems[0]}.md`]);
        expect(r.stderr).toContain("A steering act runs only from a checkout holding no claimed package");
      }
      expect(existsSync(join(p.workbench, "campaigns"))).toBe(false);
      // Two claims by this checkout is the same refusal: the helper's own refusal, carried.
      claim(p, createPackage(p, stems[1]), me);
      const two = run(p, "resume");
      expect([two.status, two.value("state")]).toEqual([8, "holds-package"]);
      expect(two.stderr).toContain("which one is in scope cannot be determined");
    });
  }, CASE_TIMEOUT * 4);

  it("usage errors exit 2 with nothing on stdout; a legacy workbench is exit 4", () => {
    withJsonProject((p) => {
      for (const args of [["open"], ["open", "--id", "pipeline", "--objective", "o", "--authorisation", "a"], ["open", "--id", ID, "--objective", "o"], ["lanes"], ["lanes", "--from", "x", "--assign", "lane-1=xyz"], ["pause"], ["resume", "--reason", "x"], ["move", "--to", "lane-1"], ["move", stems[0]], ["reassign", "lane-1", "--checkout", "A1A1A1A1"], ["end"], ["end", "--outcome", "done"], ["end", "--outcome", "bounded", "--objective-met"], ["end", "--outcome", "completed", "--watermark"]]) {
        const r = run(p, ...args);
        expect([r.status, r.stdout], args.join(" ")).toEqual([2, ""]);
      }
      expect(existsSync(join(p.workbench, "campaigns"))).toBe(false);
    });
    withJsonProject((p) => {
      const r = run(p, "open", "--id", ID, "--objective", "o", "--authorisation", "a");
      expect([r.status, r.stdout]).toEqual([4, ""]);
      expect(r.stderr).toContain("legacy");
    }, { legacy: true });
  }, CASE_TIMEOUT * 3);

  it("readProposal reads the lanes key of a cut proposal and names what is not one", () => {
    const dir = mkdtempSync(join(home, "proposal-"));
    const at = (name: string, text: string): string => (writeFileSync(join(dir, name), text), join(dir, name));
    expect(readProposal(at("ok.json", JSON.stringify({ checkouts: 2, lanes: [{ id: "lane-1", members: ["a", "b"] }, { id: "lane-2", members: [] }], handoffs: [{ from: "a", to: "c" }] })))).toEqual({ lanes: [{ id: "lane-1", members: ["a", "b"] }, { id: "lane-2", members: [] }] });
    expect(readProposal(at("no-lanes.json", "{}"))).toEqual({ detail: expect.stringContaining("no `lanes` array") });
    expect(readProposal(at("member.json", JSON.stringify({ lanes: [{ id: "lane-1", members: [1] }] })))).toEqual({ detail: expect.stringContaining("lanes[0]") });
    expect(readProposal(join(dir, "absent.json"))).toEqual({ detail: expect.stringContaining("could not be read") });
  });
});
