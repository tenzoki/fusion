import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";
import { fmt, Growth, growth, grownLines } from "./helpers/growth-bound.js";
import { agentNames } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// The emission golden — how many bytes of plugin rule text every agent loads
// on every single dispatch.
//
// WHY THIS FILE EXISTS. `bin/fusion-rules` is the only thing that decides what
// an agent reads at Setup, and its always-on list (`emit_if_exists`, one call
// per line) is unconditional: every byte in those files is paid by every agent,
// every dispatch, forever. That cost had never been measured by anything
// executable, and the four days it drifted over — 87 387 to 145 144 bytes —
// are the fact `DRIFT_CEILING` below is made of, with the per-file breakdown in
// its doc comment. A number nothing asserts is a number nobody notices moving.
//
// This file is step 1 of
// `circles/260801-1244-guard-rules-write/planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`.
// It cuts nothing. It builds the instrument the five following steps are
// measured against, so that "we reduced the context tax" is a diff and not a
// claim.
//
// WHAT IT MEASURES. For each agent: the paths `bin/fusion-rules` emits that live
// under `<plugin>/rules`, in emission order, each with its byte size, plus the
// total. Project-side rules and the stilwerk voice profiles are out of scope —
// they vary per consuming project — and are excluded by CONSTRUCTION rather than
// by a filter: the script runs with an empty temp directory as its working
// directory. `assertOnlyPluginRules` proves the exclusion held rather than
// assuming it. (THE DISPATCH-PATH BOUND below measures the other choice, from
// this repository, and says why.)
//
// WHY IT DRIVES THE REAL SCRIPT. `bin/fusion-rules` is bash; there is no
// importable module, and the seam is the script's stdout, which is exactly what
// an agent's Setup reads. The precedent and its reasoning are in
// `fusion-paths.test.ts` and `monitor-warnings-panel.test.ts`.
//
// ENVIRONMENT INDEPENDENCE. `FUSION_PLUGIN_ROOT` is forced to THIS repository
// for every call: a developer's copy points at `~/.fusion`, which carries an
// older rule set, and a test that inherited it would measure the install. The
// same hazard in the other direction is stated in `config.test.ts`'s header.
//
// WHAT IS ASSERTED, AND WHAT IS ONLY REPORTED. Five things, and each is
// documented where it is declared rather than twice — read the doc comment on
// the constant named beside it.
//
//   HARD — the GOLDEN (`fixtures/rules-emission.golden`) pins the path set, the
//      emission order, each file's size and each agent's total, and fails on any
//      change in either direction. Regenerating is one command and blocks
//      nothing; see `## Updating the golden, and re-baselining`.
//   HARD — the ROLE COVERAGE. A role with no entry in `ROLES`, or an entry no
//      agent matches any more, fails: an audience change may not happen silently.
//   HARD — the JUSTIFICATION DUTY (`RELEASE_CAP`). A prose obligation about an
//      AUDIENCE decision; it never asks anyone to cut text.
//   HARD — the DRIFT CEILING (`DRIFT_CEILING`), the far blocking number.
//   HARD — the UNIVERSAL-CORE GROWTH BOUND (`GROWTH_BUDGET`), the near one,
//      armed 2026-08-14 over the text every agent loads.
//   REPORTED, NEVER FAILING — the same budget over each role's EXTRAS, the files
//      it loads that not every agent loads.
//
//      The two read ONE `growth()` over ONE `RULE_BASELINE`, called with two
//      DISJOINT file sets — the universal core, and each role's extras — so every
//      byte the fleet loads is measured by exactly one of them and the gate and
//      the report cannot disagree about a byte. `README-hooks.md`
//      `### Growth bounds on the shipped text` states the same split for a user.
//
// WHY THE BUDGET REPORTS AND THE CORE BLOCKS. Both halves of that history are
// told once, in `surface-growth-bound.test.ts`'s `WHY THIS FILE EXISTS`: the
// 2026-08-05 conversion of the ratchet into a report (decision 260805-1559,
// a ratchet makes the first finding-driven addition unlandable), and the
// measurement that took half of it back on 2026-08-14 (the largest deletion in
// this project's history back above its pre-deletion peak in days —
// `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
// — so the binding constraint is the RATE of addition). What is local here is
// the LINE the two halves are split along: a byte of core text is charged to
// every dispatch in the fleet and no agent can decline it, so the core blocks;
// role-specific text is bought by the agents that need it, so it reports. The
// arming is capability C10 of Circle `circles/260801-1244-curator`, and its own
// entry is the last one in the cut log above `RULE_BASELINE`.
//
// WHERE THE THRESHOLD COMES FROM. It was measured, not guessed: `git log` over
// `rules/` was replayed commit by commit from 2026-05-04 to 2026-08-05, re-running
// `bin/fusion-rules` against each snapshot.
//
//   calm work, 2026-06-02 -> 2026-07-31: 38 776 -> 87 387 bytes. About 800 bytes
//     a day, arriving in steps of 1 000 to 5 000 per commit.
//   the worst run, 2026-08-01 -> 2026-08-04: 87 387 -> 145 144 in four days, about
//     14 400 a day. The worst single day was +19 484.
//   a finding-driven addition, measured: 430 bytes (decision 260805-1559).
//
// GROWTH_BUDGET = 12 000 sits INSIDE the worst measured day, so a run like
// 2026-08-01 trips the report on the day it begins rather than after it. It is
// about twenty-four finding-sized additions, so honest work is never what trips
// it. At the calm rate it comes due every two to three weeks. And the leanest role
// can spend it whole and still sit under RELEASE_CAP, so no consuming project
// pays more than origin/main already charged before the budget is even a
// question.
//
// WHY THERE IS STILL A FAR GATE. A gate that never blocks is not a gate, and a
// gate that blocks on every byte is the ratchet this file gave up. The far one
// is `DRIFT_CEILING`, and what it is and why it cannot be reached by honest work
// is in its own doc comment below.
//
// ONE FLOOR PER ROLE rather than one number for the whole fleet, because after
// the cut the agents no longer carry the same load: a single figure has to sit
// at the maximum, granting the leanest agents thousands of bytes of silent
// head-room. What a floor is, and what it is not, is on `RELEASE_CAP` below.
//
// HOW A ROLE IS DERIVED, AND WHY IT IS NOT A LIST OF NAMES. The universal core
// is computed as the INTERSECTION of every agent's emission. An agent's role is
// what is left over: the sorted set of rule files it loads that not every agent
// loads. `ROLES` is keyed by that set. Nothing here names an agent, so the
// day `bin/fusion-rules` moves an agent between audiences, the agent changes
// role by itself; and a role with no entry fails loudly instead of being
// measured against some other role's budget. A hand-written name list would
// have drifted at the first audience change, which is the failure mode this
// Circle demonstrated repeatedly.
//
// ## Updating the golden, and re-baselining
//
// One command, and it can never be left switched on — it rewrites the fixture
// and then FAILS on purpose, so a second run without the flag is forced:
//
//     cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
//
// Review the fixture diff; that is the whole obligation. Why a regeneration
// records growth and never clears a bound, and the three events at which a
// baseline may move instead, are authored twice over and not a third time here:
// the rule in `helpers/growth-bound.ts` `## Re-baselining`, the user-facing
// statement in `README-hooks.md` `### Growth bounds on the shipped text`.
//
// WHAT IS LOCAL TO THIS FILE. `RULE_BASELINE` is the reference BOTH measurements
// read — the report measures a role's extras from it, the hard bound measures the
// universal core from it — and the CUT LOG above it is where this surface's own
// events are recorded, including the 2026-08-14 arming entry that is the only
// non-cut in it. Event 3 (a merge) has not reached this surface.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "../../..");
const fusionRules = join(pluginRoot, "bin", "fusion-rules");
const rulesDir = join(pluginRoot, "rules");
const goldenPath = join(here, "fixtures", "rules-emission.golden");

/**
 * The release cap from the plan's Erfolgsmaß: the rule-text total that
 * `origin/main` already ships, undifferentiated, to every agent. It is the
 * tax a consuming project pays today, and a release that raises it is a
 * regression however much else the release fixes.
 *
 * It has never been a ceiling since 2026-08-05, and since the ratchet came out
 * it gates nothing at all. The one job it still does honestly is the BASELINE
 * for the JUSTIFICATION DUTY: a role FLOOR above it is a decision to charge a
 * consuming project more than origin/main already charged, and that decision has
 * to name the file it bought and say why that role applies it. See `justifies …`.
 *
 * READ THAT AS THE FLOOR AND NOT AS THE BILL. A role's floor is RULE_BASELINE
 * summed over its files; what the role emits is those same files at today's size,
 * which is the floor plus everything they have grown since the baseline was last
 * set. So a role can stand under this cap on its floor and over it on what it
 * actually ships, and the duty stays silent through that — the growth between the
 * two is the budget report's to raise and the hard bound's to block, never this
 * one's. Nothing here asserts what any role emits against this number.
 *
 * That duty is about the role's AUDIENCE, not about the size of anybody's prose:
 * it is discharged by writing a reason, never by cutting text, and it can only
 * change when `RULE_BASELINE` is re-cut after a cleanup. That is exactly when the
 * question "what does this fleet cost, and who pays the extra?" is worth asking
 * again, so the duty survived the ratchet on its own merits.
 *
 * NEVER RAISE THIS. Raising it would retire, silently and in one edit, every
 * justification that exists only because a role stands above it. The number is a
 * historical fact about what `origin/main` ships, and a fact is not raised.
 * Lowering it is meaningless for the same reason.
 */
const RELEASE_CAP = 105_354;

/**
 * The head-room every role gets above its floor before the run says a cleanup is
 * due. Derived from four days of replayed history rather than chosen — see
 * `WHERE THE THRESHOLD COMES FROM` in the header for the measurement and the four
 * properties this figure was picked for.
 *
 * Exceeding it fails NOTHING. It prints a report naming the files that grew.
 */
const GROWTH_BUDGET = 12_000;

/**
 * The one number that still blocks: the per-agent load the fleet actually stood
 * at on 2026-08-04, before the cut brought it down. An agent at or above it fails
 * the suite.
 *
 * It is not a budget and must never be treated as one — the budget is 12 000
 * bytes above a role's floor, and by the time an agent is anywhere near this
 * ceiling the report has been asking for a cleanup for weeks. This is the
 * backstop for the failure mode that produced this file in the first place: a
 * fleet that drifted from 87 387 to 145 144 in four days with nothing asserting
 * the number. Like RELEASE_CAP it is a historical fact and is not raised.
 */
const DRIFT_CEILING = 145_144;

/**
 * THE REFERENCE the budget measures growth from: every rule file the agents
 * load, at the size it had after the last cleanup. A role's FLOOR is these
 * numbers summed over the files that role actually loads, so the floor and the
 * per-file breakdown in the report are one fact rather than two that can disagree.
 *
 * Hand-edited, and only at one of the two events in `## Re-baselining: the two
 * events at which the baseline moves`. A
 * file the emission carries but this map does not (a newly added always-on rule)
 * counts as growth in full, which is correct: nobody granted it a budget. A file
 * this map carries that the emission dropped is simply not measured.
 *
 * Note what a role's floor does NOT track: an audience change. When an agent
 * gains a rule file, that role's floor rises by the file's baseline size and the
 * role keeps its full head-room. That is deliberate — the budget measures TEXT
 * GROWTH, while an audience change is governed by the golden (hard) and by the
 * justification duty (hard).
 *
 * The first five figures below are the 2026-08-14 arming sizes, taken when all
 * five were the core; the last three are 2026-08-05 post-cut, at v5.9.1. How the
 * number moved to get here, event by event — kept because each line names which
 * cut, or which arming, produced which figure:
 *
 *   150 817 — 2026-08-05, plan step 1 (introduced).
 *   131 685 — 2026-08-05, plan step 2 (the three-layer split by addressee).
 *   128 555 — 2026-08-05, plan step 4 (the stash-and-lock shard).
 *   111 810 — 2026-08-05, the pulled-forward C9 step 3 (the conventions file
 *             partitioned by addressee).
 *   111 766 — 2026-08-05, release preparation (five dead workbench paths).
 *    90 878 — 2026-08-06, textschicht step 8 (the guard-internals audience
 *             gated on `bin/fusion-plugin-cwd`).
 *    80 670 — 2026-08-12, protected-path removal step 9.
 *
 *             WHAT EACH CUT DID, AND WHAT IT COST PER ROLE, IS NOT RESTATED
 *             HERE. Every one of the eight is written up where it was made:
 *             the plan
 *             `circles/260801-1244-guard-rules-write/planning/260804-2356_c_plan-ausstieg-kontextsteuer-und-auslieferung.md`
 *             carries the projections and the per-role tables, and the step's
 *             own history log carries what it measured — `260805-0717-coder-step2-drei-schichten.md`,
 *             `260805-0905-coder-step4-stash-and-lock-shard.md`,
 *             `260805-1003-coder-step4a-konventionsdatei-partitionieren.md`,
 *             `260805-1200-coder-step6-release-vorbereitet.md` in the same
 *             Circle's `history/`, and `shared/history/260812-1500-coder-the-always-on-rule-its-emission-and-every-prose-citation.md`
 *             for the last. The addressee split itself is decision
 *             `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`.
 *
 *             ONE FINDING FROM THAT LOG IS KEPT, because it is the reason the
 *             2026-08-12 entry does not re-cut the baseline: RULE_BASELINE lost
 *             `protected-path-discipline.md`'s entry and nothing else moved, so
 *             the five remaining core sizes below are still the 2026-08-05 ones
 *             and the oversized entry had been masking 9 402 bytes of real
 *             growth. With the mask gone the budget report fires for every
 *             role, correctly: re-baselining there would have absolved that
 *             growth in the same edit that removed the thing hiding it.
 *    86 573 — 2026-08-14, at the ARMING of the universal-core growth bound.
 *             NOT A CUT, and the only entry in this log that is not one. No byte
 *             was removed and no rule file was touched for its size. What moved
 *             is the baseline: the five core entries below take the sizes the
 *             regenerated golden reported at this moment, so that the hard bound
 *             armed in this step has a reference to bound growth FROM. The three
 *             role-specific entries are untouched and still stand at their
 *             2026-08-05 post-cut sizes, which is why the diff of this change
 *             shows exactly which half moved. Capability C10 of Circle
 *             `circles/260801-1244-curator`, plan step 5. The core-only role
 *             stands at 86 573 and the measured high-water mark, the
 *             orchestrator, at 111 474.
 *
 *             THE STANDING CLEANUP REQUEST, KEPT AS TEXT. A re-baseline absolves
 *             the growth it re-baselines over, so the report this arming
 *             silences is written down here rather than disappearing with the
 *             number. Measured immediately before the re-baseline, every one of
 *             the five roles was over its head-room — the state the 2026-08-12
 *             entry above describes, still true on the day this one was written:
 *
 *               role                                      emitted  budget  over by
 *               (core only)                                86 573  75 654   10 919
 *               design-diagrams.md                         92 246  81 327   10 919
 *               circle-records.md                          98 522  84 956   13 566
 *               circle-records.md + design-diagrams.md    104 195  90 629   13 566
 *               circle-records.md + stash-and-lock.md     111 474  94 206   17 268
 *
 *             The whole of that overshoot is UNIVERSAL-CORE growth: 22 919 bytes
 *             added to the five always-on files since the 2026-08-05 cut, against
 *             12 000 of head-room. Per file, `fusion-workbench-conventions.md`
 *             +17 356, `critical-stance.md` +4 641, `agent-setup.md` +721,
 *             `user-facing-output.md` +101, `decision-record-examples.md` +100.
 *             The role-specific files grew too and are NOT absolved: their
 *             entries do not move here, so `workbench-stash-and-lock.md` (+3 702)
 *             and `circle-records.md` (+2 647) still count against the report.
 *             The spec's table for C10 reads 107 bytes lower per role because it
 *             was measured at HEAD d7786eb, before this Circle's own steps added
 *             that much to `fusion-workbench-conventions.md`.
 *
 *             WHY THIS IS AN ARMING AND NOT THE SILENT RAISE THIS FILE WARNS
 *             AGAINST. The rule it overrides was written for a REPORTING
 *             instrument, where the baseline's only job is to keep the report
 *             actionable. Under a BLOCKING gate the baseline acquires a second
 *             job, defining what the gate blocks on, and a gate armed on a corpus
 *             already 22 919 bytes past its head-room ships red on the day it
 *             lands. Cutting the corpus back first was the alternative and was
 *             explicitly removed from this Circle's scope; shipping the red suite
 *             was the third option and was not seriously proposed. The user chose
 *             the re-baseline on 2026-08-14, having been shown that it overrides
 *             the position recorded here. What that position protects against —
 *             a raise that quietly retires the cleanup the report was asking for
 *             — is preserved by the table above, which outlives the number.
 *             Binding record:
 *             `circles/260801-1244-curator/decisions/260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`.
 */
const RULE_BASELINE: Record<string, number> = {
  // The 2026-08-14 ARMING block: one provenance, NOT one measurement. Its 86 573
  // sum is a historical label, not the HARD bound's input — that is the computed
  // intersection, since the 2026-08-27 gates the three marked `core` (floor
  // 65 498, budget 77 498). The other two stay: a dropped entry reads as growth.
  "agent-setup.md": 3_513, // arming; core -> HARD bound
  "fusion-workbench-conventions.md": 52_027, // arming; core -> HARD bound
  "decision-record-examples.md": 4_291, // arming; role-specific at gate 260827-0830 -> REPORT
  "user-facing-output.md": 16_784, // arming; role-specific at gate 260827-0910 -> REPORT
  "critical-stance.md": 9_958, // arming; core -> HARD bound
  // Role-specific, each loaded by a derived audience rather than a named list.
  // These and the two gated entries above are what the REPORT measures. NOT
  // touched by the 2026-08-14 arming: that growth still stands against the report.
  "design-diagrams.md": 5_673, // 2026-08-05 cut
  "circle-records.md": 9_302, // 2026-08-05 cut
  "commit-lock.md": 9_250, // 2026-08-05 cut, carried through the 2026-08-15 rename
};

interface Role {
  /**
   * Why this role's floor stands above RELEASE_CAP: which file carries the
   * overage, and why this role applies that file. REQUIRED for every floor above
   * the release cap, and asserted to name each of the role's extra files by
   * filename, so a later cut cannot leave the reason pointing at a file the role
   * no longer loads. Omitted below the release cap, where the role costs a
   * consuming project nothing and has nothing to justify.
   */
  overRelease?: string;
}

/**
 * One entry per ROLE, where a role is the sorted set of rule files an agent loads
 * that not every agent loads — see `HOW A ROLE IS DERIVED` in the header.
 * The key is that set, rendered by `roleKey()`. No agent is named as a key, and
 * membership is never written down: it is measured, and the messages print it.
 *
 * The entries carry no number. A role's floor is `RULE_BASELINE` summed over the
 * files that role loads, so a role can neither be granted head-room by hand nor
 * left pointing at a figure the emission moved away from. The comments below say
 * what each role buys and why; the arithmetic is the map's.
 *
 * Every role is still below RELEASE_CAP, the orchestrator's by 229 bytes. A
 * role's floor is RULE_BASELINE summed over its files, and it is NOT what the
 * role emits today: for the core files the two are equal, and for a role's
 * extras the gap between them is what the budget report prints. The figures
 * below are the floors measured between the 2026-08-14 arming and 2026-08-22,
 * under role KEYS the gates of 2026-08-27 re-cut, the bounded-dispatch audience
 * re-cut again, and the dispatch bound's retirement on 2026-09-10 re-cut back —
 * they are kept as the record of what the fleet stood at, not as a listing of
 * the map. The map is the only authority for which roles exist, and
 * how many agents each holds is not written here at all: it is measured, and the
 * messages print it.
 *
 *    86 573  the core floor, carried by any role whose extras are all unbaselined
 *    92 246  design-diagrams.md
 *    95 875  circle-records.md
 *   101 548  circle-records.md + design-diagrams.md
 *   105 125  circle-records.md + commit-lock.md
 */
const ROLES: Record<string, Role> = {
  /**
   * The agents that edit the tree as they work and carry nothing beyond the
   * always-on core: coder and ontocoder. `bugfixer` was the third until v11,
   * when it was removed and its diagnose-before-editing contract moved into
   * these two — prompt text, not a rule file, so the role's file set is
   * unchanged by that.
   *
   * THE ROLE CAME BACK on 2026-09-10. It had been the floor every other role was
   * read against until the bounded-dispatch audience gave these three
   * `bounded-dispatch.md` and emptied it; the dispatch bound was retired, that
   * file was deleted, and its whole audience fell back to whatever else it
   * carried. The number that says what the always-on set costs is still the hard
   * bound's own measurement of the universal core rather than this role's floor
   * — the two are equal here, and only one of them is the definition.
   */
  "(core only)": {},

  /**
   * The reconciler: the worked transitions, because worked transition 1,
   * `_o_ -> _a_`, is its act (gate 260827-0830). It carried
   * `bounded-dispatch.md` beside them until the bound's retirement on
   * 2026-09-10.
   */
  "decision-record-examples.md": {},

  /**
   * The agent that writes review files. It pays for `review-contract.md`, the
   * single authoring home of the review header's two mandated fields, the
   * per-topic working files and the final consolidated review. The file arrived
   * on 2026-08-22 out of the two review prompts, where the same contract stood
   * twice with no pointer between the copies; at v11 those two prompts merged
   * as well, so the role that was two agents is one. It has no `RULE_BASELINE`
   * entry, so this role's floor is the core alone.
   */
  "review-contract.md": {},

  /**
   * The design-diagram producers. They pay 5 673 for the shared Mermaid rubric
   * so that one definition of "coherent" governs every diagram the fleet draws.
   * Until 2026-08-15 the role also held the evaluator that judged their output;
   * removing it left the role's file set unchanged, which is why this entry did
   * not move.
   */
  "design-diagrams.md": {},

  /** The planner: diagrams plus the worked transitions (gate 260827-0830). */
  "decision-record-examples.md + design-diagrams.md": {},

  // A role stood here for the agent that ranked Circles and maintained the
  // backlog: circle-records.md + decision-record-examples.md +
  // user-facing-output.md + backlog-entries.md. It went at v11 with the
  // portfolio layer. `backlog-entries.md` did not go with it — the four
  // confirm-gated operations became the orchestrator's, so that file followed
  // them into the role below, which is why that key grew a name rather than
  // this one merely disappearing.

  /**
   * Turns a Directive into a Circle record and draws the design diagram that
   * goes in it, so it pays for both files. It used to be the role closest to the
   * release cap, 483 bytes under it; the 2026-08-12 cut put 26 725 bytes between
   * them and the 2026-08-14 arming re-baseline brought that back to 3 806. The
   * role that would cross the cap first is no longer this one but the
   * orchestrator's, below.
   */
  "circle-records.md + decision-record-examples.md + design-diagrams.md + user-facing-output.md": {},

  // consultant, and since 2026-09-10 the curator too: a user-read surface (gate
  // 260827-0910). The curator held its own role while it also carried
  // `bounded-dispatch.md` — the change ledger it puts to the user at the gate is
  // read in the terminal, and its survey accumulated one normative surface at a
  // time — and the retirement of the bound merged it into this one.
  "user-facing-output.md": {},
  "project-language.md + user-facing-output.md": {}, // editor: + the language cascade, its deliverable halt (decision 260827-1056)

  /**
   * NOT OVER THE RELEASE CAP, and the role that would cross it first. It was
   * over by 3 094 bytes when this entry was written; the 2026-08-12 cut put
   * 23 148 between them, and the 2026-08-14 arming re-baseline — which re-set the
   * five core entries this role also pays for — brought that margin down to 229
   * bytes. The `overRelease` reason below is kept rather than deleted: the
   * justification duty is discharged by prose, the prose is still true of this
   * role, and a floor that moves back up would otherwise silently find no reason
   * where one had been written. The assertion skips it while the floor is under
   * the cap, and nothing an editor writes to a rule file spends that margin: the
   * floor is RULE_BASELINE summed over this role's files, so editing one moves
   * what the role EMITS and not what it stands on, and a newly added always-on
   * file has no baseline entry, contributes 0 to the floor and counts as growth
   * in full against the hard bound instead. Two things can move a floor — a
   * re-baseline at one of the two events in `## Re-baselining`, and an audience
   * change in `bin/fusion-rules` that hands this role another already-baselined
   * file. What the next core-file edit meets is the hard bound at
   * +GROWTH_BUDGET, not this cap.
   *
   * `circle-records.md` (9 302) is the Circle state vocabulary and the record
   * and portfolio templates. This role writes those transitions — it activates
   * a Circle on `_a_ -> _t_` and closes it on `_t_ -> _c_` — so the vocabulary
   * is the text it acts on, not background.
   *
   * `commit-lock.md` is `## Commit lock`, and nothing else since 2026-08-15,
   * when the stash half was deleted with the two skills that consumed it. The
   * commit lock is this role's to take: it is the agent that commits after a
   * task completes, and the lock is what serialises that against the other
   * agents' writes. Its baseline entry (9 250) did NOT move with the rename or
   * with the truncation — a rename is neither re-baselining event, and the
   * shrink is growth this role is credited with rather than absolved of.
   *
   * The most role-specific text of any role, because this is the agent with the
   * most distinct jobs. The overage is not shaveable from the core, where every
   * remaining byte is text every agent applies.
   */
  "backlog-entries.md + circle-records.md + commit-lock.md + decision-record-examples.md + user-facing-output.md": {
    overRelease:
      "circle-records.md (9 302) carries the Circle state vocabulary and the record " +
      "template, and this role is the one that writes the `_a_ -> _t_` and `_t_ -> _c_` " +
      "transitions. commit-lock.md (9 250 at baseline) carries the commit lock this " +
      "role takes before every commit, which bin/fusion-rules cannot deliver to the two " +
      "committing skills; decision-record-examples.md (4 291) and user-facing-output.md (16 784) left the always-on floor into this role at gates 260827-0830/-0910.",
  },

};

/**
 * An agent's role, derived from measurement: its emitted files minus the ones
 * every agent gets. Sorted, so the key does not depend on emission order.
 */
function roleKey(extras: string[]): string {
  return extras.length === 0 ? "(core only)" : [...extras].sort().join(" + ");
}

/**
 * `growth()` and the `Growth` shape it returns live in
 * `helpers/growth-bound.ts`, shared with `surface-growth-bound.test.ts`. What is
 * local to this file is WHICH file sets it is called with, and with what
 * baseline and head-room.
 *
 * ONE function over ONE `RULE_BASELINE`, called with two DISJOINT file sets —
 * the universal core, which the hard bound measures, and a role's extras, which
 * the report measures — so the two can never disagree about a byte and no byte
 * is measured twice or missed. `floor` is `RULE_BASELINE` summed over the same
 * files; a file with no baseline entry contributes 0, so its whole current size
 * reads as growth, which is correct: nobody granted it a budget.
 */
const ruleGrowth = (files: { rel: string; size: number }[]): Growth =>
  growth(files, RULE_BASELINE, GROWTH_BUDGET);

/**
 * The hard bound's failure text. Factored out of the assertion so the unit tests
 * at the bottom of this file can prove it names the file that grew, without any
 * rule file having to be edited to produce a failure.
 */
function hardBoundMessage(g: Growth): string {
  return [
    "",
    `The ALWAYS-ON rule set — the text every agent loads on every dispatch — has ` +
      `grown ${fmt(g.delta)} bytes past its baseline, which is ` +
      `${fmt(g.total - g.budget)} beyond the ${fmt(GROWTH_BUDGET)} of head-room it ` +
      `gets (${fmt(g.total)} emitted, budget ${fmt(g.budget)} = floor ` +
      `${fmt(g.floor)} + ${fmt(GROWTH_BUDGET)}).`,
    "grown since the baseline was last set:",
    ...grownLines(g),
    "",
    "This is the one budget that FAILS instead of reporting, because every byte of " +
      "it is charged to every dispatch in the fleet and no agent can opt out. Cut " +
      "the text where the growth is, then regenerate the golden with:",
    "",
    "  cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts",
    "",
    "Regenerating does NOT clear this: the golden records what the files weigh, " +
      "RULE_BASELINE records what they are allowed to weigh from. RULE_BASELINE " +
      "moves at exactly the three events named in `## Re-baselining: the three " +
      "events at which a baseline moves` in helpers/growth-bound.ts — after a " +
      "cleanup, at a one-time arming written into the cut log, or at a merge of two " +
      "lines that were each inside this bound. Editing it to make this " +
      "assertion pass is none of them.",
    "",
  ].join("\n");
}

/**
 * What this emission weighed at the last re-baseline: the baseline sizes of
 * exactly the files it carries.
 */
function floorOf(e: Emission): number {
  return ruleGrowth(e.files).floor;
}

/** The files every agent loads — the intersection. */
function universalCore(measured: Map<string, Emission>): Set<string> {
  const sets = [...measured.values()].map((e) => new Set(e.files.map((f) => f.rel)));
  const [first, ...rest] = sets;
  if (!first) return new Set();
  return new Set([...first].filter((rel) => rest.every((s) => s.has(rel))));
}

interface Emission {
  /** Path relative to `<plugin>/rules`, in emission order. */
  files: { rel: string; size: number }[];
  total: number;
}

let neutralCwd: string;

beforeAll(() => {
  // An empty directory: no ./rules, no .claude/rules, no ./CLAUDE.md, no
  // ./fusion-workbench. Whatever the script emits from here is plugin-side by
  // construction.
  neutralCwd = mkdtempSync(join(tmpdir(), "fusion-rules-golden-"));
});

afterAll(() => {
  if (neutralCwd) rmSync(neutralCwd, { recursive: true, force: true });
});

/**
 * Raw stdout lines of `bin/fusion-rules <agent> [...extra]`, run in the neutral
 * cwd. `extra` defaults to nothing, so every existing caller — the golden, the
 * roles, both bounds — measures exactly the call it measured before the audience
 * argument existed. Only the audience cases below pass anything.
 */
function runRules(agent: string, extra: string[] = []): string[] {
  const stdout = execFileSync(fusionRules, [agent, ...extra], {
    cwd: neutralCwd,
    encoding: "utf-8",
    env: { ...process.env, FUSION_PLUGIN_ROOT: pluginRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Lines that are NOT plugin rule files. Expected empty from the neutral cwd;
 * asserted rather than filtered so that a project-side path, or a `skill:<name>`
 * manifest pointer, can never leak into the measurement unnoticed.
 */
function foreignLines(lines: string[]): string[] {
  return lines.filter((p) => !p.startsWith(rulesDir + "/"));
}

function measure(agent: string): Emission {
  const lines = runRules(agent);
  const files = lines
    .filter((p) => p.startsWith(rulesDir + "/"))
    .map((p) => ({ rel: relative(rulesDir, p), size: statSync(p).size }));
  return { files, total: files.reduce((n, f) => n + f.size, 0) };
}

/** One agent's block, in the exact shape the golden stores. */
function render(agent: string, e: Emission): string {
  const body = e.files.map((f) => `  ${f.rel} ${f.size}`).join("\n");
  return `[${agent}]\n${body}\n  total ${e.total}`;
}

const GOLDEN_HEADER = [
  "# rules-emission.golden — the per-dispatch rule-context tax, per agent.",
  "#",
  "# Generated. Do not hand-edit. To update after a deliberate cut:",
  "#",
  "#   cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts",
  "#",
  "# That run rewrites this file and then fails on purpose, so the flag can",
  "# never be left on in a green run. Reviewing the diff is the whole obligation:",
  "# growth is allowed here, and the budget report says when a cleanup is due.",
  "#",
  "# One block per agent: the files bin/fusion-rules emits under <plugin>/rules,",
  "# in emission order, each with its byte size, then the agent's total. Paths",
  "# are relative to <plugin>/rules. Project-side rules and stilwerk voice",
  "# profiles are out of scope — they vary per consuming project.",
].join("\n");

/** Parse the golden into blocks keyed by agent. */
function parseGolden(text: string): Map<string, string> {
  const blocks = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) blocks.set(current, buf.join("\n").replace(/\n+$/, ""));
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("#")) continue;
    const head = /^\[([a-z-]+)\]$/.exec(line.trim());
    if (head) {
      flush();
      current = head[1];
      buf = [line.trim()];
      continue;
    }
    if (current && line.trim().length > 0) buf.push(line.replace(/\s+$/, ""));
  }
  flush();
  return blocks;
}

const UPDATING = process.env.UPDATE_RULES_GOLDEN === "1";

describe("rules emission golden", () => {
  let measured: Map<string, Emission>;
  let agents: string[];
  /** The files every agent loads. */
  let core: Set<string>;
  /** Role key -> the agents measured into it. Derived, never written down. */
  let roles: Map<string, string[]>;

  beforeAll(() => {
    agents = agentNames();
    measured = new Map(agents.map((a) => [a, measure(a)]));

    core = universalCore(measured);
    roles = new Map();
    for (const a of agents) {
      const extras = measured.get(a)!.files.map((f) => f.rel).filter((rel) => !core.has(rel));
      const key = roleKey(extras);
      roles.set(key, [...(roles.get(key) ?? []), a]);
    }

    if (UPDATING) {
      const body = agents.map((a) => render(a, measured.get(a)!)).join("\n\n");
      writeFileSync(goldenPath, `${GOLDEN_HEADER}\n\n${body}\n`, "utf-8");
    }
  });

  it("was not run with the update flag left switched on", () => {
    expect(
      UPDATING,
      `The golden at ${relative(pluginRoot, goldenPath)} has been REWRITTEN from live ` +
        `measurement. This failure is deliberate — it stops a regeneration run from ` +
        `ever being green. Now: (1) read the fixture diff and confirm every change is ` +
        `one you intended, (2) re-run without UPDATE_RULES_GOLDEN. RULE_BASELINE ` +
        `does NOT move with the golden: it is re-cut only at the two events in ` +
        `\`## Re-baselining\` above, so a regeneration records growth and never ` +
        `absolves it.`,
    ).toBe(false);
  });

  it("measures the consuming-project context — the plugin-repo gate is provably off", () => {
    // One emission behaviour is gated on cwd being the fusion plugin's own repo
    // (`bin/fusion-plugin-cwd`: a .claude-plugin/plugin.json at cwd naming
    // "fusion"): the work-tree rules preference of decision 260806-0015
    // (option c), asserted in the next test. This golden claims to measure the
    // CONSUMING context, so the neutral cwd must not satisfy the criterion —
    // the plan's falsifier for step 8 was a temp cwd that accidentally measures
    // the plugin-repo branch.
    //
    // The guard-internals reference (`protected-path-internals.md` for
    // coder/coderev/bugfixer) used to be the second gated emission and was
    // asserted here in both directions. It is gone with the shell classifier it
    // documented (Circle 260807-0923-guard-misst-statt-orakelt, step 6), so the
    // in-repo and consuming rule SETS are identical again and only the rule
    // DIRECTORY differs between them.
    expect(
      existsSync(join(neutralCwd, ".claude-plugin", "plugin.json")),
      "The neutral cwd carries a plugin manifest, so every byte total below " +
        "measures the plugin-repo emission, not the consuming-project one.",
    ).toBe(false);
  });

  it("prefers the work tree's rules over $FUSION_PLUGIN_ROOT inside the plugin repo", () => {
    // Decision 260806-0015 (option c): in the plugin's own repo the source is
    // the meant rule state. FUSION_PLUGIN_ROOT is pointed at the neutral cwd —
    // which ships no rules at all — so every rule path emitted can only have
    // come from the work tree. Consuming-context behaviour is untouched, which
    // the golden above pins byte for byte.
    const emitted = execFileSync(fusionRules, ["orchestrator"], {
      cwd: pluginRoot,
      encoding: "utf-8",
      env: { ...process.env, FUSION_PLUGIN_ROOT: neutralCwd },
      stdio: ["ignore", "pipe", "pipe"],
    })
      .split("\n")
      .filter((l) => l.trim().length > 0);
    expect(
      emitted,
      "Inside the plugin repo, with FUSION_PLUGIN_ROOT pointing at an empty " +
        "directory, the rule emission should come from the work tree's ./rules.",
    ).toContain(join(rulesDir, "agent-setup.md"));
    expect(emitted.filter((l) => l.startsWith(neutralCwd))).toEqual([]);
  });

  it("emits nothing but plugin rule files when no project rules are in reach", () => {
    const leaks: Record<string, string[]> = {};
    for (const a of agents) {
      const foreign = foreignLines(runRules(a));
      if (foreign.length > 0) leaks[a] = foreign;
    }
    expect(
      leaks,
      "bin/fusion-rules emitted a path outside <plugin>/rules from an empty working " +
        "directory. Either the script reaches somewhere it should not, or the temp " +
        "cwd is not as empty as this test assumes; in both cases the byte totals " +
        "below stopped measuring what they claim to measure.",
    ).toEqual({});
  });

  it("matches the checked-in golden, agent by agent", () => {
    expect(
      existsSync(goldenPath),
      `Missing ${relative(pluginRoot, goldenPath)}. Create it with: ` +
        `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`,
    ).toBe(true);

    const golden = parseGolden(readFileSync(goldenPath, "utf-8"));

    expect(
      [...golden.keys()].sort(),
      "The golden covers a different set of agents than agents/*.md. An agent was " +
        "added or removed; regenerate the golden.",
    ).toEqual(agents);

    for (const a of agents) {
      expect(
        render(a, measured.get(a)!),
        `Rule emission for '${a}' changed. If a cut caused this, regenerate the ` +
          `golden deliberately (see the header of this file). If it was not intended, ` +
          `the change to bin/fusion-rules or rules/ is the bug.`,
      ).toBe(golden.get(a));
    }
  });

  it("assigns every agent a role derived from what it actually loads", () => {
    expect(
      core.size,
      "No rule file is loaded by every agent, so there is no universal core " +
        "and every agent would be its own role. Either bin/fusion-rules stopped " +
        "emitting an always-on set, or a run failed and returned nothing.",
    ).toBeGreaterThan(0);

    const unknown = [...roles.keys()].filter((k) => !(k in ROLES));
    expect(
      unknown.map((k) => `${k} <- ${roles.get(k)!.join(", ")}`),
      "A role appeared that ROLES has no entry for. A role is the set of rule files " +
        "an agent loads that not every agent loads, so this means an audience in " +
        "bin/fusion-rules changed. Add an entry keyed by that file set, saying what " +
        "the role buys and why — and if its floor is above " +
        `${RELEASE_CAP}, an \`overRelease\` naming the file that carries the overage.`,
    ).toEqual([]);

    const stale = Object.keys(ROLES).filter((k) => !roles.has(k));
    expect(
      stale,
      "ROLES carries an entry no agent matches any more. The cut that removed the " +
        "role should have removed its entry in the same commit; an entry nothing is " +
        "measured against is a claim about the fleet that nothing checks.",
    ).toEqual([]);
  });

  it("holds the always-on rule set — what every agent loads — inside its budget", () => {
    // THE HARD BOUND, armed 2026-08-14 (capability C10 of
    // `circles/260801-1244-curator`). It measures the UNIVERSAL CORE and nothing
    // else: the files the intersection above proves every agent loads. Growth
    // here is charged to every dispatch in the fleet and no agent can decline
    // it, which is the whole reason this one fails where the role report only
    // prints. The disjoint other half is the test below.
    //
    // Every agent emits the same core files at the same sizes — that is what
    // makes them the core — so one agent's emission carries the whole set.
    const coreFiles = measured.get(agents[0])!.files.filter((f) => core.has(f.rel));
    expect(
      coreFiles.length,
      "The universal core is empty, so this bound would pass on a measurement of " +
        "nothing. The role-coverage test above says why that can happen.",
    ).toBe(core.size);

    const g = ruleGrowth(coreFiles);
    expect(g.over, hardBoundMessage(g)).toBe(false);
  });

  it("reports, without failing, when a role's own rule text is due for a cleanup", () => {
    // The report this file was built for, narrowed on 2026-08-14 to each role's
    // EXTRAS — the files it loads that not every agent loads. The core moved to
    // the hard bound above, so the two sets are disjoint and every byte the
    // fleet loads is measured exactly once. Role-specific growth still only
    // reports: it is bought by the agents that need it, and the ratchet this
    // file gave up in 2026-08-05 is what blocking it again would be.
    //
    // Every member of a role loads the same files, so one member is enough.
    const extrasOf = (key: string) =>
      measured.get(roles.get(key)![0])!.files.filter((f) => !core.has(f.rel));

    const lines: string[] = [];

    // Worst overage first: the role furthest past its budget is the one to act on.
    const byOverage = [...roles.keys()]
      .filter((key) => extrasOf(key).length > 0)
      .sort((a, b) => ruleGrowth(extrasOf(b)).delta - ruleGrowth(extrasOf(a)).delta);

    for (const key of byOverage) {
      const g = ruleGrowth(extrasOf(key));
      if (!g.over) continue;

      lines.push(
        `role '${key}' — ${roles.get(key)!.join(", ")}`,
        `  ${fmt(g.total)} bytes of role-specific rule text, budget ${fmt(g.budget)} ` +
          `(floor ${fmt(g.floor)} + ${fmt(GROWTH_BUDGET)})`,
        "grown since the last cut:",
        ...grownLines(g),
        "",
      );
    }

    if (lines.length > 0) {
      console.warn(
        [
          "",
          "─".repeat(78),
          "ROLE RULE-TEXT BUDGET — a cleanup is due. This does not fail the suite.",
          "",
          ...lines,
          "-> cut where the growth is, then re-baseline that file's RULE_BASELINE",
          "   entry in hooks/lib/__tests__/rules-emission-golden.test.ts from the",
          "   regenerated golden. Until then this report stands; it is not a blocker.",
          "─".repeat(78),
          "",
        ].join("\n"),
      );
    }

    // Asserted so the test is not a no-op that could silently stop running: it
    // proves the report was COMPUTED, never that it was empty.
    expect(roles.size).toBeGreaterThan(0);
  });

  it("justifies in this source every role whose floor stands above the release cap", () => {
    const unjustified: string[] = [];
    const unanchored: string[] = [];

    for (const [key, members] of roles) {
      const entry = ROLES[key];
      if (!entry) continue; // reported by the role-coverage test above
      const floor = floorOf(measured.get(members[0])!);
      if (floor <= RELEASE_CAP) continue;

      const reason = entry.overRelease?.trim() ?? "";
      if (reason.length === 0) {
        unjustified.push(`'${key}' (floor ${floor}, ${floor - RELEASE_CAP} over)`);
        continue;
      }
      // The reason has to name the files that carry the overage, or it is prose
      // that survives the cut which made it wrong. A role with no extra files has
      // none to name — its overage is the shared core, which is the fleet's to
      // answer for and not this role's.
      const extras = key === "(core only)" ? [] : key.split(" + ");
      const missing = extras.filter((f) => !reason.includes(f));
      if (missing.length > 0) unanchored.push(`'${key}' does not mention ${missing.join(", ")}`);
    }

    expect(
      unjustified,
      `A role's floor stands above the release baseline of ${RELEASE_CAP} bytes with no ` +
        "reason recorded next to it. Every consuming project pays that overage on every " +
        "dispatch. Give the entry an `overRelease` naming the file that carries it and " +
        "why that role applies it. This asks for PROSE, never for a cut: the floor only " +
        "moves when RULE_BASELINE is re-cut, which is exactly the moment to say again " +
        "what this fleet costs and who pays the extra.",
    ).toEqual([]);

    expect(
      unanchored,
      "A role's over-the-baseline reason does not name the rule files the role loads. " +
        "The reason has to name them, so that a cut which moves a file leaves the reason " +
        "visibly wrong instead of quietly stale.",
    ).toEqual([]);
  });

  it("gates the release on the drift ceiling the fleet once reached", () => {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf-8"),
    ) as { version: string };

    // The last blocking number, and deliberately a distant one. Until 2026-08-05
    // this gate read the role caps, so it failed a release for a single byte of
    // growth — which is the ratchet the user took out, not a release policy. A
    // gate that never blocks is not a gate either, so what stayed is the level
    // the fleet ACTUALLY reached on 2026-08-04 before the cut: 145 144 bytes per
    // agent, arrived at in four days with nothing asserting the number.
    //
    // Between the budget report and this ceiling there is a wide advisory zone,
    // and that is the point. The report asks for a cleanup early and often; the
    // ceiling only catches the case where every one of those reports was ignored
    // all the way back to the worst state this project has been in.
    //
    // It binds at every version, not only past some literal: every run is a
    // potential release, and a version literal maintained by hand is exactly the
    // kind of second source this gate was rewritten to stop having.
    const blocking: string[] = [];
    for (const [key, members] of roles) {
      for (const a of members) {
        const total = measured.get(a)!.total;
        if (total >= DRIFT_CEILING) {
          blocking.push(
            `${a} loads ${fmt(total)}, at or past the ${fmt(DRIFT_CEILING)} drift ` +
              `ceiling (role '${key}', ${fmt(total - DRIFT_CEILING)} over)`,
          );
        }
      }
    }

    expect(
      blocking,
      `Version ${manifest.version} may not be released. The rule text has drifted back ` +
        `to ${fmt(DRIFT_CEILING)} bytes an agent — the level of 2026-08-04, before the cut. ` +
        "The budget report will have been asking for a cleanup for weeks by now; this " +
        "is the backstop for having ignored it. Cut the rule text and re-baseline " +
        "RULE_BASELINE. Raising DRIFT_CEILING is not the third option: it is a " +
        "historical fact about a state this project decided to leave.",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// THE AUDIENCE ARGUMENT — the one emission a dispatch can ask for by name.
//
// Every other conditional in `bin/fusion-rules` is keyed on the agent NAME, and
// a name answers "what is this role always". It cannot answer "who reads this
// run's output", so a role that holds a gate on some dispatches and reports to
// the orchestrator on the rest carries the whole user-facing style contract on
// every one of them — 10 884 bytes, the single largest conditional there is.
// `--audience=user` asks the dispatch instead. Decision
// `260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md`,
// option 1, deliberately scoped to this ONE file.
//
// WHAT THESE CASES PIN, AND WHY EACH IS HERE. The scope, because a flag that
// quietly moved a second emission would be the additive thicket the decision
// declined. The fallback, because the three roles that are user-facing by nature
// must keep the file with no parameter at all — no path may LOSE the rule by
// default. And the two refusals, because a misspelt value that emitted nothing
// would be indistinguishable from a correct call whose rule file is missing.
// ---------------------------------------------------------------------------
describe("the audience argument", () => {
  const rel = (lines: string[]) => lines.map((p) => relative(rulesDir, p));

  it("adds exactly user-facing-output.md, for an agent the name list excludes", () => {
    const plain = rel(runRules("planner"));
    const asked = rel(runRules("planner", ["", "--audience=user"]));
    expect(plain, "planner is user-facing by name after all; pick another agent").not.toContain(
      "user-facing-output.md",
    );
    expect(
      asked.filter((f) => !plain.includes(f)),
      "the audience argument moved something other than the user-facing contract",
    ).toEqual(["user-facing-output.md"]);
    expect(plain.filter((f) => !asked.includes(f)), "the flag removed an emission").toEqual([]);
  });

  it("moves nothing else for any agent — the other conditionals stay keyed on the name", () => {
    // The scope claim, asserted over the whole roster rather than one agent, so
    // that keying a SECOND conditional on the audience cannot land unnoticed.
    for (const a of agentNames()) {
      const plain = rel(runRules(a));
      const asked = rel(runRules(a, ["", "--audience=user"]));
      expect(
        asked.filter((f) => !plain.includes(f)),
        `the audience argument changed more than one emission for '${a}'`,
      ).toEqual(plain.includes("user-facing-output.md") ? [] : ["user-facing-output.md"]);
    }
  });

  it("keeps the name list as the fallback, so no role loses the rule by default", () => {
    for (const a of ["orchestrator", "editor", "curator"]) {
      expect(rel(runRules(a)), `${a} lost the user-facing contract`).toContain(
        "user-facing-output.md",
      );
      expect(
        rel(runRules(a, ["", "--audience=user"])),
        `${a}'s emission is not idempotent under the flag`,
      ).toEqual(rel(runRules(a)));
    }
  });

  it("refuses an unrecognised audience and an unrecognised option, printing nothing", () => {
    for (const [args, needle] of [
      [["planner", "", "--audience=users"], "unknown audience"],
      [["planner", "--bogus"], "unknown option"],
    ] as [string[], string][]) {
      const r = spawnSync(fusionRules, args, {
        cwd: neutralCwd,
        encoding: "utf-8",
        env: { ...process.env, FUSION_PLUGIN_ROOT: pluginRoot },
      });
      expect(r.status, `${args.join(" ")} did not fail`).toBe(1);
      expect(r.stdout, "a refused call emitted a partial rule set").toBe("");
      expect(r.stderr).toContain(needle);
    }
  });
});

// ---------------------------------------------------------------------------
// growth(), proved on synthetic file sets.
//
// The behaviours the hard bound and the report both rest on, exercised on
// INVENTED byte counts against the real RULE_BASELINE. Nothing here reads or
// edits a rule file: proving that growth fails would otherwise mean bloating an
// always-on rule to see the gate fire, which is the one experiment this file
// exists to make unnecessary.
// ---------------------------------------------------------------------------
describe("growth(), on synthetic file sets", () => {
  /** Three real core files, each at exactly its baseline: zero growth by construction. */
  const CORE = ["agent-setup.md", "fusion-workbench-conventions.md", "critical-stance.md"];
  /** One real role-specific file — the disjoint half the hard bound must not see. */
  const EXTRA = "circle-records.md";

  const at = (rels: string[]) => rels.map((rel) => ({ rel, size: RULE_BASELINE[rel] }));

  it("keeps growth in a role-specific file out of the universal-core measurement", () => {
    // The disjointness the two gates rest on: the same overshoot that fires the
    // report cannot reach the hard bound, because the hard bound is never called
    // with that file.
    const extras = [{ rel: EXTRA, size: RULE_BASELINE[EXTRA] + 2 * GROWTH_BUDGET }];
    expect(ruleGrowth(extras).over, "role-specific growth should reach the report").toBe(true);
    expect(ruleGrowth(at(CORE)).over, "and should not reach the hard bound").toBe(false);
  });

  it("names the file that grew, and the way out, in the hard bound's message", () => {
    const files = at(CORE);
    files[1].size += GROWTH_BUDGET + 500;
    const msg = hardBoundMessage(ruleGrowth(files));
    expect(msg).toContain(CORE[1]);
    expect(msg).toContain(`+${fmt(GROWTH_BUDGET + 500)}`);
    expect(msg).toContain("UPDATE_RULES_GOLDEN=1");
    expect(msg).toContain("## Re-baselining: the three events at which a baseline moves");
    expect(msg).toContain("helpers/growth-bound.ts");
  });
});

// ---------------------------------------------------------------------------
// THE DISPATCH-PATH BOUND — everything one dispatch loads, per path, zero-sum.
//
// WHAT IT MEASURES AND WHY IT IS NOT THE BOUND ABOVE. The hard bound above
// measures the UNIVERSAL CORE: the rule files every agent loads. That is a
// floor, and a floor is blind to two thirds of what a dispatch actually reads.
// Over the thirteen days from 2026-08-27 to 2026-09-09 the coder path rose
// 154 440 -> 188 256 bytes, 21.9 percent, and the core bound was green on every
// day of it: 43 percent of the rise was `CLAUDE.md`, which it does not measure
// at all, and the rest was in conditionally emitted rule files, which are
// outside the intersection by construction. A cut nothing measures buys a
// fortnight — that is what those thirteen days cost, and it is the whole reason
// this bound exists.
//
// So the quantity here is the PER-PATH TOTAL: the agent's own prompt, plus every
// path `bin/fusion-rules` emits for it, plus `CLAUDE.md`. Fifteen paths, fifteen
// independent baselines, and HEAD-ROOM ZERO — an addition of N bytes to any
// component requires a removal of at least N from the same path's total. It is
// not a budget and must not be read as one.
//
// WHY THE EMISSION IS MEASURED FROM THIS REPOSITORY AND NOT FROM THE NEUTRAL
// CWD. The golden above measures the plugin's own rule text, project-side files
// excluded by construction, because that is a property of the plugin. This bound
// is about what a dispatch READS, and two of its three components are the
// project's: `CLAUDE.md`, and the project-side rules and stilwerk voice profiles
// that `bin/fusion-rules` emits alongside the plugin's. So it runs the script
// from the repository root, and the difference between the two measurements
// (2 696 bytes for every agent, plus 3 021 for the prose agents) is the voice
// profiles this project ships — real bytes, charged to every dispatch.
//
// WHERE THE BASELINE LIVES, AND WHY IT IS A FIXTURE. In
// `fixtures/dispatch-path.baseline`, hand-edited, never generated. It carries
// its own arming provenance and its own statement of what the arming absolved,
// the way `RULE_BASELINE`'s cut log does above. It sits in a fixture rather than
// in this source for one reason: a bound whose whole justification is a replay
// over a historical window has to be replayable, and a replay is then a data
// swap against a checked-out tree rather than an edit to the instrument being
// tested. Nothing here writes it — UPDATE_RULES_GOLDEN=1 rewrites the emission
// golden and does not touch this file.
// ---------------------------------------------------------------------------

const dispatchBaselinePath = join(here, "fixtures", "dispatch-path.baseline");

/**
 * ZERO, and it is the point. Every other surface in this project gets head-room
 * above its baseline because those bounds measure the RATE of addition. This one
 * measures the LEVEL: the fifteen rows are what the fleet stood at before the cut
 * that this instrument was built to keep, so any head-room at all is head-room
 * the cut created and would immediately be spent, which is what the thirteen days
 * after 2026-08-27 measured.
 */
const DISPATCH_HEAD_ROOM = 0;

const promptRel = (a: string) => `agents/${a}.md`;
const rulesRel = (a: string) => `rules emitted to ${a}`;

/** Component sizes per path, keyed by the same `rel` strings the measurement uses. */
function parseDispatchBaseline(text: string): Map<string, Record<string, number>> {
  const out = new Map<string, Record<string, number>>();
  let current: string | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const head = /^\[([a-z-]+)\]$/.exec(line);
    if (head) {
      current = head[1];
      out.set(current, {});
      continue;
    }
    const entry = /^(.*\S)\s+(\d+)$/.exec(line);
    if (current && entry) out.get(current)![entry[1]] = Number(entry[2]);
  }
  return out;
}

/** Raw emission for one agent, run from the repository root — project-side included. */
function dispatchEmission(agent: string): string[] {
  return execFileSync(fusionRules, [agent], {
    cwd: pluginRoot,
    encoding: "utf-8",
    env: { ...process.env, FUSION_PLUGIN_ROOT: pluginRoot },
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

interface Component {
  rel: string;
  size: number;
}

/** The three components of one dispatch path, at today's sizes. */
function dispatchComponents(agent: string, emitted: string[]): Component[] {
  const rules = emitted.reduce((n, p) => n + statSync(resolve(pluginRoot, p)).size, 0);
  return [
    { rel: promptRel(agent), size: statSync(join(pluginRoot, "agents", `${agent}.md`)).size },
    { rel: rulesRel(agent), size: rules },
    { rel: "CLAUDE.md", size: statSync(join(pluginRoot, "CLAUDE.md")).size },
  ];
}

/**
 * The bound's failure text. Factored out so the synthetic tests below can prove
 * it names the path and the component that grew, and carries the two sentences
 * the specification requires it to carry, without any real file being edited.
 */
function dispatchBoundMessage(over: { agent: string; g: Growth }[]): string {
  const lines = [
    "",
    `${over.length} dispatch path(s) stand above the baseline armed for them in ` +
      `${relative(pluginRoot, dispatchBaselinePath)}. This bound has ZERO head-room: ` +
      "the bytes a dispatch reads before it reads one line of the project's own work " +
      "may not rise above what they were when the baseline was armed.",
    "",
  ];
  for (const { agent, g } of over) {
    lines.push(
      `path '${agent}' — ${fmt(g.total)} bytes, ${fmt(g.delta)} above its baseline of ${fmt(g.floor)}`,
      "grown since the baseline was armed:",
      ...grownLines(g),
      "",
    );
  }
  lines.push(
    "CLAUDE.md and the always-on rule files are SHARED COMPONENTS: each is counted " +
      "in every path's total, so N bytes added to one of them puts all fifteen paths " +
      "N over at once. A shared component's addition must be offset ONCE IN A SHARED " +
      "COMPONENT, or ONCE PER PATH — in each path's own prompt, or in the " +
      "conditionally emitted rules only that path receives. There is no third way to " +
      "land it, and no path may be left over while another is under.",
    "",
    "The baseline moves only at the three events in helpers/growth-bound.ts " +
      "`## Re-baselining: the three events at which a baseline moves`, and NO " +
      "RE-BASELINING EVENT COVERS A GROWING CLAUDE.md. That rule was written for a " +
      "surface fusion owns; two of this quantity's three components belong to the " +
      "project, and no fourth event was added for them. Inside this repository a " +
      "larger CLAUDE.md is offset against another component of the same paths or it " +
      "is not landed. Editing the fixture to make this assertion pass is none of the " +
      "three events.",
    "",
  );
  return lines.join("\n");
}

describe("dispatch-path byte bound", () => {
  let baseline: Map<string, Record<string, number>>;
  let emissions: Map<string, string[]>;
  let paths: Map<string, Component[]>;
  let dispatchAgents: string[];

  beforeAll(() => {
    baseline = parseDispatchBaseline(readFileSync(dispatchBaselinePath, "utf-8"));
    dispatchAgents = agentNames();
    emissions = new Map(dispatchAgents.map((a) => [a, dispatchEmission(a)]));
    paths = new Map(
      dispatchAgents.map((a) => [a, dispatchComponents(a, emissions.get(a)!)]),
    );
  });

  const boundFor = (agent: string, files: Component[]) =>
    growth(files, baseline.get(agent)!, DISPATCH_HEAD_ROOM);

  it("carries a baseline row for every agent, and every emitted path is a file", () => {
    expect(
      [...baseline.keys()].sort(),
      "The baseline fixture covers a different set of agents than agents/*.md. An " +
        "agent was added or removed. A path with no row is NOT bounded, so adding " +
        "the row is part of adding the agent — measure the three components at the " +
        "commit that adds it and write them in. A row for an agent that is gone is a " +
        "claim about a path nothing measures.",
    ).toEqual(dispatchAgents);

    const pointers: Record<string, string[]> = {};
    for (const a of dispatchAgents) {
      const skills = emissions.get(a)!.filter((l) => l.startsWith("skill:"));
      if (skills.length > 0) pointers[a] = skills;
    }
    expect(
      pointers,
      "bin/fusion-rules emitted a `skill:<name>` manifest pointer. It costs context " +
        "when the skill is invoked and it has no byte size at the pointer, so this " +
        "measurement stopped being a total the moment one appeared.",
    ).toEqual({});
  });

  it("states each row's total as the sum of its own three components", () => {
    const wrong: string[] = [];
    for (const [agent, row] of baseline) {
      const parts = [promptRel(agent), rulesRel(agent), "CLAUDE.md"];
      const missing = parts.filter((k) => !(k in row));
      if (missing.length > 0) {
        wrong.push(`'${agent}' has no entry for ${missing.join(", ")}`);
        continue;
      }
      const sum = parts.reduce((n, k) => n + row[k], 0);
      if (row.total !== sum) wrong.push(`'${agent}' states ${row.total}, components sum to ${sum}`);
    }
    expect(
      wrong,
      "A baseline row's stated total disagrees with its own components, or names a " +
        "component this bound does not measure. The total is redundant on purpose — " +
        "it is the figure the C8 table published, and this check is what stops a " +
        "typo in a component from arming the bound at a number nobody derived.",
    ).toEqual([]);
  });

  it("holds every dispatch path's total at or below the baseline armed for it", () => {
    const over = dispatchAgents
      .map((agent) => ({ agent, g: boundFor(agent, paths.get(agent)!) }))
      .filter((x) => x.g.over)
      .sort((a, b) => b.g.delta - a.g.delta);

    expect(
      over.map((x) => x.agent),
      dispatchBoundMessage(over),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The dispatch-path bound, proved on synthetic component sizes.
//
// Growth is applied to a COPY of the measured components, so proving that the
// bound fires costs no edit to a rule file, a prompt or CLAUDE.md — which is the
// same reason the synthetic block above exists.
// ---------------------------------------------------------------------------
describe("the dispatch-path bound, on synthetic component sizes", () => {
  const baseline = parseDispatchBaseline(readFileSync(dispatchBaselinePath, "utf-8"));
  const agents = [...baseline.keys()];
  const atBaseline = (a: string): Component[] =>
    [promptRel(a), rulesRel(a), "CLAUDE.md"].map((rel) => ({ rel, size: baseline.get(a)![rel] }));
  const bump = (files: Component[], rel: string, by: number): Component[] =>
    files.map((f) => (f.rel === rel ? { ...f, size: f.size + by } : f));
  const overOf = (mutate: (a: string) => Component[]) =>
    agents.filter((a) => growth(mutate(a), baseline.get(a)!, DISPATCH_HEAD_ROOM).over);

  it("passes every path when each component stands exactly at its baseline", () => {
    expect(overOf(atBaseline)).toEqual([]);
  });

  it("fails every path when a shared always-on rule file grows", () => {
    // An always-on file is inside the `rules emitted to <a>` aggregate of every
    // path, so growth in it lands on all fifteen at once.
    expect(overOf((a) => bump(atBaseline(a), rulesRel(a), 1))).toEqual(agents);
  });

  it("fails every path when CLAUDE.md grows", () => {
    expect(overOf((a) => bump(atBaseline(a), "CLAUDE.md", 1))).toEqual(agents);
  });

  it("fails only the paths that receive a conditionally emitted rule", () => {
    // Derived, never listed: the recipients are read off the real emission, so
    // an audience change in bin/fusion-rules moves this test's expectation with
    // it instead of leaving a stale name list behind.
    const recipients = agents.filter((a) =>
      dispatchEmission(a).some((p) => p.endsWith("/circle-records.md")),
    );
    expect(recipients.length, "no agent receives circle-records.md any more").toBeGreaterThan(0);
    expect(recipients.length, "every agent receives it, so it is not conditional").toBeLessThan(
      agents.length,
    );
    expect(
      overOf((a) => (recipients.includes(a) ? bump(atBaseline(a), rulesRel(a), 1) : atBaseline(a))),
    ).toEqual(recipients);
  });

  it("offsets a shared component's addition once per path, and nowhere else", () => {
    // The way out the failure text names: N bytes added to CLAUDE.md, N taken
    // out of each path's own prompt. Offsetting only one path leaves the other
    // fourteen over, which is what makes the rule per-path rather than a fleet
    // average.
    const grow = (a: string) => bump(atBaseline(a), "CLAUDE.md", 200);
    expect(overOf((a) => bump(grow(a), promptRel(a), -200))).toEqual([]);
    expect(overOf((a) => (a === agents[0] ? bump(grow(a), promptRel(a), -200) : grow(a)))).toEqual(
      agents.filter((a) => a !== agents[0]),
    );
  });

  it("names the path, the component that grew, and both standing sentences", () => {
    const a = "coder";
    const g = growth(bump(atBaseline(a), "CLAUDE.md", 512), baseline.get(a)!, DISPATCH_HEAD_ROOM);
    const msg = dispatchBoundMessage([{ agent: a, g }]);
    expect(msg).toContain("path 'coder'");
    expect(msg).toContain("CLAUDE.md");
    expect(msg).toContain(`+${fmt(512)}`);
    expect(msg).toContain(
      "must be offset ONCE IN A SHARED COMPONENT, or ONCE PER PATH",
    );
    expect(msg).toContain("NO RE-BASELINING EVENT COVERS A GROWING CLAUDE.md");
    expect(msg).toContain("## Re-baselining: the three events at which a baseline moves");
  });
});
