import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
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
// executable, and it grew from 87 387 bytes (2026-07-31) to 145 144 bytes
// (2026-08-04) inside the very Circle whose goal was to reduce it —
// `rules/protected-path-discipline.md` alone went 11 032 -> 50 559 in four days.
// A number nothing asserts is a number nobody notices moving.
//
// This file is step 1 of
// `circles/260801-1244-guard-rules-write/planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`.
// It cuts nothing. It builds the instrument the five following steps are
// measured against, so that "we reduced the context tax" is a diff and not a
// claim.
//
// WHAT IT MEASURES. For each agent: the paths `bin/fusion-rules`
// emits that live under `<plugin>/rules`, in emission order, each with its byte
// size, plus the total. Project-side rules (`./rules`, `.claude/rules`) and the
// stilwerk voice profiles are deliberately out of scope — both vary per
// consuming project, so neither is a property of the plugin. They are excluded
// by CONSTRUCTION, not by a filter: the script runs with an empty temp
// directory as its working directory, so there is nothing project-side for it
// to find. `assertOnlyPluginRules` then proves the exclusion held rather than
// assuming it, because a filter that silently drops an unexpected line is how a
// measurement quietly stops measuring.
//
// WHY IT DRIVES THE REAL SCRIPT. `bin/fusion-rules` is bash; there is no
// importable module. `fusion-paths.test.ts` and `monitor-warnings-panel.test.ts`
// set the precedent of driving a real `bin/` script through child_process, and
// this file follows it. The seam is the script's stdout, which is exactly what
// an agent's Setup reads.
//
// ENVIRONMENT INDEPENDENCE. `FUSION_PLUGIN_ROOT` is forced to THIS repository
// for every call. A developer almost always has it pointing at their installed
// copy (`~/.fusion`), which carries a different — usually older — rule set; a
// test that inherited it would measure the install, not the source tree, and
// would report whatever the developer last installed.
//
// WHAT IS ASSERTED, AND WHAT IS ONLY REPORTED.
//
//   HARD — the GOLDEN (`fixtures/rules-emission.golden`) pins the path set, the
//      emission order, each file's size and each agent's total. It fails on any
//      change in either direction, including a cut that removes more than
//      intended. It is meant to be regenerated whenever a change is deliberate;
//      see `## Updating the golden`. Regenerating is one command and blocks
//      nothing — the golden's job is to put every movement into a diff somebody
//      reads, not to stop the movement.
//
//   HARD — the ROLE COVERAGE. A role is derived from measurement (see below). A
//      role with no entry in `ROLES`, or an entry no agent matches any more,
//      fails. An audience change in `bin/fusion-rules` is a decision, and it may
//      not happen silently.
//
//   HARD — the JUSTIFICATION DUTY. A role whose floor stands above RELEASE_CAP
//      has to say in `overRelease` which file carries the overage and why that
//      role applies it. It is a prose obligation about an AUDIENCE decision — it
//      never asks anyone to cut text.
//
//   HARD — the DRIFT CEILING. The far blocking number; see below.
//
//   HARD — the UNIVERSAL-CORE GROWTH BOUND. The near one, armed 2026-08-14. The
//      rule text EVERY agent loads gets GROWTH_BUDGET bytes of head-room above
//      its baseline, and past that the suite FAILS. Charged to every dispatch in
//      the fleet, opt-out impossible; see `WHY THE CORE BLOCKS AND THE EXTRAS
//      REPORT` below.
//
//   REPORTED, NEVER FAILING — the BUDGET on ROLE-SPECIFIC text. Each role's
//      EXTRAS — the files it loads that not every agent loads — get their own
//      GROWTH_BUDGET of head-room above `RULE_BASELINE`. Past that, the run
//      PRINTS which files grew and by how much and says a cleanup is due. It
//      does not fail.
//
//      The two read ONE `growth()` over ONE `RULE_BASELINE`, called with two
//      DISJOINT file sets: the universal core, and each role's extras. Every
//      byte the fleet loads is measured by exactly one of them, so the gate and
//      the report cannot disagree about a byte.
//
// WHY THE BUDGET REPORTS INSTEAD OF BLOCKING. Until 2026-08-05 this file carried
// a ratchet: one cap per role, pinned to that role's measured high-water mark and
// allowed to move in one direction only. It held the line, and it also made the
// first finding-driven addition unlandable — the only way past it was to cut
// somebody else's reasoned prose by the same number of bytes, which is the damage
// the ratchet existed to prevent (decision 260805-1559). The user's answer was to
// keep the MEASUREMENT and drop the BLOCK: growth is allowed, and from time to
// time the text gets cleaned up. This file's job is to say when a cleanup is due,
// in a form somebody can act on — which file grew, and by how much. Without the
// per-file breakdown the report is a number nobody can do anything with.
//
// WHY THE CORE BLOCKS AND THE EXTRAS REPORT. On 2026-08-14 half of that answer
// was taken back, deliberately and along one line: the universal core blocks
// again, and only the role-specific text still merely reports. The reason the
// ratchet failed was that it made a finding-driven addition unlandable unless
// somebody else's reasoned prose was cut by the same number of bytes. That
// argument holds where the text is bought by the agents that need it, and it
// does not hold for the core, where a byte is charged to every dispatch in the
// fleet and no agent can decline it. The report also had three years' worth of
// evidence against it in this project's own history: the 2026-08-05 partition
// was undone inside a week, and the largest deletion this project ever performed
// was back above its pre-deletion peak in four days
// (`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`).
// A report is not a bound, and the binding constraint was measured to be the
// RATE of addition rather than the size of the system. So the core gets a rate
// bound and the extras keep the report. Capability C10 of Circle
// `circles/260801-1244-curator`; the arming itself is the last entry in the cut
// log above `RULE_BASELINE`.
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
// is DRIFT_CEILING = 145 144 — the level the fleet actually reached on
// 2026-08-04, before the cut. No finding-driven addition can reach it; it stands
// weeks of calm-rate growth above the worst-off agent, and long before it is in
// reach the near gate will have blocked and the budget report will have been
// asking for a cleanup. It makes "back to 145 kB in four days without anyone noticing"
// impossible by construction rather than by attention, which is the failure this
// file exists to stop.
//
// ONE FLOOR PER ROLE rather than one number for the whole fleet, because after
// the cut the agents no longer carry the same load. A single figure has to sit at
// the maximum, so it would grant the leanest agents thousands of bytes of silent
// head-room and call that compliance.
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
// ## Updating the golden
//
// Deliberate, one command, and it can never be left switched on:
//
//     cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
//
// That run rewrites the fixture from live measurement and then FAILS on
// purpose. The failure is the point: it forces a second run without the flag,
// and it means no CI or habitual `vitest run` can ever be green while the flag
// is set. Review the fixture diff — that is the whole obligation. For
// ROLE-SPECIFIC text nothing else has to move: a size change costs a
// regeneration, never a cut. For the UNIVERSAL CORE that stopped being true on
// 2026-08-14: a regeneration records the growth, and if the core has spent its
// head-room the hard bound fails until the text comes back down. Regenerating
// the golden does not move `RULE_BASELINE` and therefore never clears the bound.
//
// ## Re-baselining
//
// `RULE_BASELINE` is the reference both measurements read: the report measures a
// role's extras from it, and the hard bound measures the universal core from it.
// It is hand-edited, and it moves at exactly two moments, neither of which is the
// silent raise this file warns about. THE RULE IS AUTHORED ONCE, in
// `helpers/growth-bound.ts` `## Re-baselining: the two events at which a baseline
// moves`, because since 2026-08-15 four surfaces obey it and a second copy would
// be a second rule. Read it there. What is local to this file is the CUT LOG
// above `RULE_BASELINE`, where the two events are recorded for THIS surface, and
// the 2026-08-14 arming entry that is the only non-cut in it.
//
// `npx vitest run` is enough for this file: it measures rule text and needs no
// compile at all. `npm test` also works and no longer wipes anything — the
// build stopped deleting `hooks/dist/` (`scripts/build.mjs`), which is what
// made a second run in the same checkout fail the suites that read it.
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
 * The five CORE figures below are the 2026-08-14 arming sizes; the three
 * ROLE-SPECIFIC ones are still the 2026-08-05 post-cut sizes, at v5.9.1. How the
 * number moved to get here, event by event — kept because each line names which
 * cut, or which arming, produced which figure:
 *
 *   150 817 — 2026-08-05, at plan step 1. Introduced. The six design-diagram
 *             agents (analyst, conceptrev, investigator, planner, shaper,
 *             taskplanner) carry `design-diagrams.md` (5 673) on top of the
 *             145 144 always-on set the other ten load.
 *   131 685 — 2026-08-05, at plan step 2. `protected-path-discipline.md` was cut
 *             into three layers by ADDRESSEE (decision 260805-0709): the core
 *             rule (16 346, all sixteen agents), the classifier reference
 *             `protected-path-internals.md` (20 754, `coder`/`coderev`/
 *             `bugfixer` only), and the measured forensics, which left `rules/`
 *             for the Circle's analysis store and is loaded by nothing.
 *             The high-water mark is now the three guard-internals agents, which
 *             carry both rule layers; the seven plain agents stand at 110 931 and
 *             the six diagram agents at 116 604.
 *
 *             NOTE, and it is the finding of the step rather than an aside: NO
 *             agent is under RELEASE_CAP after this cut, and the plan's own
 *             projection (104 600) never covered the six diagram agents either —
 *             at the plan's projected core size they would have stood at 110 273,
 *             over the cap before a single byte of this step was written. Step 4
 *             removes a further 8 484 from every agent, which clears the cap for
 *             the seven plain agents alone. The other nine need a fourth cut that
 *             does not exist in the plan.
 *   128 555 — 2026-08-05, at plan step 4. `## Stashes` and `## Commit lock` left
 *             `fusion-workbench-conventions.md` (59 303 -> 51 416) for
 *             `workbench-stash-and-lock.md` (renamed `commit-lock.md` on
 *             2026-08-15, when the stash half was deleted with its two skills),
 *             emitted to `orchestrator` alone
 *             because a mechanism bounds that audience: skills are never served
 *             by `bin/fusion-rules`, and the lock is the orchestrator's to take.
 *             Every agent drops 7 887 — the 8 484 the sections weighed, less the
 *             597-byte pointer block the plan requires at both sites. The
 *             orchestrator alone RISES, 114 545 -> 115 908: it pays the 9 250 of
 *             the new file (the sections plus a 766-byte provenance header) to
 *             save 7 887. The high-water mark stays the three guard-internals
 *             agents at 128 555; the six plain agents stand at 106 658 and the
 *             six diagram agents at 112 331.
 *
 *             STILL OVER THE CAP, and the shortfall is now the whole story: the
 *             best-off agent is 1 304 bytes above RELEASE_CAP and the worst is
 *             23 201 above. The plan's step-4 target (96 500) was unreachable
 *             from the step-3 position before this step began. What is left is
 *             the cut the plan explicitly excludes — partitioning the remaining
 *             51 416 bytes of `fusion-workbench-conventions.md` (C9 step 3).
 *   111 810 — 2026-08-05, at the pulled-forward C9 step 3: the conventions file
 *             itself was partitioned by ADDRESSEE, 51 416 -> 34 671. Three shards
 *             left it. `workbench-path-resolution.md` (8 962: the `<name>`
 *             namespace, the key table, the key-set derivation) and
 *             `rule-file-provenance.md` (5 745) are emitted to NO agent — their
 *             addressee is whoever authors a prompt, the resolver, or a rule
 *             file, which is nobody's routine dispatch work. `circle-records.md`
 *             (9 302: the Circle state vocabulary, its transitions, the record
 *             and portfolio templates) goes to `orchestrator`, `playmaker` and
 *             `shaper` — a DERIVED audience, being exactly the agents whose
 *             prompts name a Circle-scoped `fusion-paths` key and therefore the
 *             only ones that can transition a Circle. The marker-glob discipline
 *             stayed behind in the core under `## Marker globs`: it was filed
 *             inside the circles section for historical reasons, but it governs
 *             every marker in every vocabulary, and eight of the ten citations
 *             that pointed at the circles section were reaching for it.
 *
 *             THIRTEEN of sixteen agents are now under RELEASE_CAP, and the
 *             three that are not are the finding rather than a shortfall to be
 *             closed by cutting further. `coder`/`coderev`/`bugfixer` stand at
 *             111 810, 6 456 over: they alone carry `protected-path-internals.md`
 *             (21 897), so their overage is step 2's split, not this one's. The
 *             `orchestrator` stands at 108 465, 3 111 over, carrying both
 *             `workbench-stash-and-lock.md` (9 250) and `circle-records.md` —
 *             18 552 bytes of agent-specific text, because it is the agent with
 *             the most distinct jobs. Every remaining byte in the core is text
 *             all sixteen agents apply; getting these three under the cap means
 *             revisiting a file this step did not own, not shaving this one.
 *   111 766 — 2026-08-05, at release preparation. Not a cut: the five shipped
 *             sentences that named the measured forensics by full workbench path
 *             now name where it lives instead, because the installer never
 *             copies `fusion-workbench/` and the path carried this Circle's own
 *             directory name, so it resolved for no consumer under any
 *             circumstance (issue 260805-1145). `protected-path-discipline.md`
 *             19 960 -> 19 943 (all sixteen agents), `protected-path-internals.md`
 *             21 897 -> 21 870 (three agents). Every role drops 17; the
 *             guard-internals role drops 44.
 *    90 878 — 2026-08-06, at step 8 of the textschicht plan. Not a text cut but
 *             an audience made precise: the guard-internals emission is now
 *             gated on cwd being the fusion plugin's own repo
 *             (`bin/fusion-plugin-cwd`), because in a consuming project the
 *             audience "whoever changes or reviews the classifier" is empty by
 *             construction — the classifier's sources sit in the installed
 *             plugin, outside the project tree. In the CONSUMING context this
 *             file measures, coder/coderev/bugfixer therefore drop
 *             `protected-path-internals.md` (21 870) and join the core-only
 *             role; the measured high-water mark is now the orchestrator at
 *             109 430. In the plugin repo itself the three still load it.
 *    80 670 — 2026-08-12, at step 9 of the protected-path removal.
 *             `protected-path-discipline.md` (10 541 at deletion) was the
 *             agent-facing statement of a mechanism the plan removed from the
 *             guard, so the rule went with its subject rather than being cut for
 *             size. Every one of the sixteen roles drops the same 10 541 and
 *             gains 121, `critical-stance.md` 9 837 -> 9 958: its worked case
 *             said in the present tense that the guard "now" compares a
 *             fingerprint of the protected paths, which the same step made
 *             false, and correcting a false claim in an always-on rule costs
 *             what it costs. Net -10 420 per dispatch, on every role. The
 *             core-only role stands at 80 670 and the measured high-water mark,
 *             the orchestrator, at 104 521.
 *
 *             RULE_BASELINE loses that file's entry and NOTHING ELSE was
 *             re-cut, which is deliberate and has a visible consequence: the
 *             baseline sizes below are still the 2026-08-05 ones, the five
 *             remaining core files have grown 17 016 bytes since, and the
 *             oversized `protected-path-discipline.md` entry (19 943 against a
 *             10 541 file) had been masking 9 402 of that. With the mask gone
 *             the budget report fires for every role. That report is correct and
 *             is the instrument working: the growth is real, it was never cut,
 *             and re-baselining here would have absolved it in the same edit
 *             that removed the thing hiding it.
 *
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
  // The universal core — text every agent applies, and the exact set the HARD
  // bound measures. 86 573 bytes, re-set once at the 2026-08-14 arming; the cut
  // log's last entry says what that re-baseline absolved and why it is not the
  // silent raise this file warns about.
  "agent-setup.md": 3_513, // 2026-08-14 arming
  "fusion-workbench-conventions.md": 52_027, // 2026-08-14 arming
  "decision-record-examples.md": 4_291, // 2026-08-14 arming
  "user-facing-output.md": 16_784, // 2026-08-14 arming
  "critical-stance.md": 9_958, // 2026-08-14 arming
  // Role-specific, each loaded by a derived audience rather than a named list,
  // and the set the REPORT measures. Deliberately NOT touched by the 2026-08-14
  // arming: their growth since the last real cut still stands against the report.
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
 * Six roles: five at the 2026-08-14 arming and `review-contract.md` since
 * 2026-08-22. Every one of them is still below RELEASE_CAP, the orchestrator's
 * role by 229 bytes. The figures are FLOORS —
 * RULE_BASELINE summed over the role's files — not what the role emits today:
 * for the five core files the two are now equal, and for a role's extras the gap
 * between them is what the budget report prints. How many agents each role holds
 * is not written here; it is measured, and the messages print it.
 *
 *    86 573  core only
 *    86 573  review-contract.md — no baseline entry, so the floor is the core
 *    92 246  design-diagrams.md
 *    95 875  circle-records.md
 *   101 548  circle-records.md + design-diagrams.md
 *   105 125  circle-records.md + commit-lock.md
 */
const ROLES: Record<string, Role> = {
  /**
   * The plain agents: everything the framework asks of everyone, and nothing
   * else. This is the floor the other roles are measured against, and the
   * only number that says what the always-on set actually costs.
   *
   * Since 2026-08-06 this includes coder, coderev and bugfixer. They carried a
   * classifier reference (`protected-path-internals.md`) that emitted only in
   * the plugin's own repo; the file went with the shell classifier it
   * documented (Circle 260807-0923-guard-misst-statt-orakelt, step 6), so the
   * three are plain agents in every context now.
   */
  "(core only)": {},

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

  /**
   * Ranks Circles without producing design diagrams. Pays 9 302 for the Circle
   * state vocabulary, which it needs because it reads and orders every Circle
   * record there is and proposes which one should activate next.
   *
   * It is the one role in the Circle-key audience that does not itself rename a
   * marker — `agents/playmaker.md` forbids it, and the rename stays with the
   * orchestrator at Phase 4 or with the user via /fusion:next. That does not
   * take it out of the audience: `bin/fusion-rules` derives membership from
   * naming a Circle-scoped `fusion-paths` key, and a proposal has to be written
   * in the same vocabulary as the transition it proposes.
   */
  "circle-records.md + decision-record-examples.md + user-facing-output.md": {},

  /**
   * Turns a Directive into a Circle record and draws the design diagram that
   * goes in it, so it pays for both files. It used to be the role closest to the
   * release cap, 483 bytes under it; the 2026-08-12 cut put 26 725 bytes between
   * them and the 2026-08-14 arming re-baseline brought that back to 3 806. The
   * role that would cross the cap first is no longer this one but the
   * orchestrator's, below.
   */
  "circle-records.md + decision-record-examples.md + design-diagrams.md + user-facing-output.md": {},

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
  /**
   * The two agents that write review files. They pay for `review-contract.md`,
   * the single authoring home of the review header's two mandated fields, the
   * per-topic working files and the final consolidated review. It arrived on
   * 2026-08-22 out of `agents/coderev.md` and `agents/ontorev.md`, where the
   * same contract stood twice with no pointer between the copies; the role
   * exists so that one file governs both review kinds. It has no
   * `RULE_BASELINE` entry, so this role's floor is the core alone and the file
   * counts as growth in full against the role budget's report.
   */
  "review-contract.md": {},

  "user-facing-output.md": {}, // consultant, editor, curator: user-read surfaces (gate 260827-0910)

  /** The reconciler: worked transition 1, `_o_ -> _a_`, is its act (gate 260827-0830). */
  "decision-record-examples.md": {},

  "circle-records.md + commit-lock.md + decision-record-examples.md + user-facing-output.md": {
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
      "moves at exactly the two events named in `## Re-baselining: the two events " +
      "at which a baseline moves` in helpers/growth-bound.ts — after a cleanup, or at " +
      "a one-time arming written into the cut log. Editing it to make this " +
      "assertion pass is neither of them.",
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

/** Raw stdout lines of `bin/fusion-rules <agent>`, run in the neutral cwd. */
function runRules(agent: string): string[] {
  const stdout = execFileSync(fusionRules, [agent], {
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

  it("sits at zero growth when every file is at its baseline", () => {
    const g = ruleGrowth(at(CORE));
    expect(g.delta).toBe(0);
    expect(g.over).toBe(false);
    expect(g.grown).toEqual([]);
  });

  it("goes over once the set has spent its whole head-room", () => {
    const files = at(CORE);
    files[1].size += GROWTH_BUDGET + 1;
    const g = ruleGrowth(files);
    expect(g.delta).toBe(GROWTH_BUDGET + 1);
    expect(g.over).toBe(true);
  });

  it("never goes over on a shrink, however large — this bounds the rate of addition", () => {
    const files = at(CORE);
    files[1].size -= 20_000;
    const g = ruleGrowth(files);
    expect(g.delta).toBe(-20_000);
    expect(g.over).toBe(false);
    expect(g.grown).toEqual([]);
  });

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
    expect(msg).toContain("## Re-baselining: the two events at which a baseline moves");
    expect(msg).toContain("helpers/growth-bound.ts");
  });
});
