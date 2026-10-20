# Consultation: review of the plan "a consuming project's CLAUDE.md stays a pointer file"

**Date:** 2026-10-20 09:34
**Status:** Complete
**Requested by:** Kai Stalmann, through the orchestrator ("nutze den consultant als reviewer"), work package `261020-0917-consumer-claude-md-stays-lean`

## Question

Is plan `261020-0927-plan-consumer-claude-md-stays-lean.md` fit to go to the user for approval? The dispatch asked six questions: whether it stops growth, whether the relocation route works for krk, whether D1 to D3 are sound, the risks of Steps 6 and 7, whether the Step 1 cut is safe and the head-room figures hold, and what is missing or over-built.

**Verdict: accept with changes.** The plan's structure is sound and its figures are correct. Two gaps go to its purpose, though. First, the destination it names for topic-bound content would, as worded, relocate bytes without removing them from what a session loads. Second, the main cause (48 %) gets only a prose rule, although the plan's own decidability principle points to a mechanical check that is cheap.

## Context

- Store note: `bin/fusion-paths consultant` resolves `OUT_CONSULT=shared/consultations` even with the work item set, so this report is in the shared store and not in the package container. The dispatch asked for the container. The resolver decides.
- HEAD `74bc9661`, fusion 13.2.0. The plan's measurements were taken at `4f17492a`. Since then only workbench files have changed, so the shipped surfaces are the same.
- I checked the plan's Current State claims against the files they cite. The ones I re-verified are listed under Analysis.

## Analysis

### 1. Does the plan stop growth? Partly. Prevention rests on prose only, and the plan leaves the one decidable lever unused.

The 48 % share comes from plan steps such as "im Abschnitt „Was man nicht sieht" je ein Absatz zu …" (analysis §3). Each of them passed the user's plan approval. Step 1 adds a rule that the planner should name why such content binds every session. That changes what the planner *should* write. It does not change what the user sees at approval. In krk, 44 of 53 plans named `CLAUDE.md` (analysis §1), and they were approved together with everything else in them.

The plan's own **Decidability** line says "only decidable facts are machine-computed". *Whether a plan step's `Files:` line names `CLAUDE.md`* is decidable from the text. So is the byte size the step proposes to add, where the step quotes its text. The plan computes neither. This is the gap the dispatch suspected, and it is real.

How enforcement fits fusion's norms:

- fusion does not hard-block on chosen thresholds. The plan-size ceiling was ruled report-only (`260909-1700_*`, cited at `README-hooks.md:228`).
- A "MUST" in an agent prompt is not enforcement, by fusion's own convention (`CLAUDE.md` `## Conventions`, "Critical procedures").
- The open decision `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` describes this exact pattern. Its option 1 is "a rule that constrains a mechanical, syntactic property lands with an executable check". It is deferred, not ruled.

The integral fix is therefore **not** a lint. Tests run only in fusion's own repository, so a lint would never see a krk plan. The fix is a **surfaced fact at the approval the user already gives**. At `agents/orchestrator.md:223` ("APPROVAL: Plan review. Present the plan summary"), the summary names every step whose `Files:` line names `CLAUDE.md`. A second option, and a cheaper one: the planner's step template (`agents/implementation-planner.md:115-119`) gains one structural field, `CLAUDE.md: <why every session needs it>`, required only on such steps. A missing field is then visible at a glance instead of buried in prose. Either option costs well under 200 bytes. The orchestrator has 3 719 bytes of dispatch-path slack and the planner 821 (both verified, see §5). Each reaches the user at the moment the 48 % passed through.

Review fixes (21 %, Step 3) and curator corrections (16 %, Step 8) are addressed in proportion to their share.

### 2. The relocation route: `--placement` is necessary but not sufficient for krk, and the destination as worded is wrong.

**The decisive finding.** Claude Code loads every `.claude/rules/*.md` file that has no `paths:` frontmatter at launch, "with the same priority as `.claude/CLAUDE.md`". A rule file *with* `paths:` loads only when Claude reads or edits a matching file (code.claude.com/docs/en/memory, "Organize rules with `.claude/rules/`" and "Path-specific rules", fetched 2026-10-20). fusion's convention sends project-wide topic rules to `.claude/rules/` (`rules/context-lean-claude-md.md:70-72`, `bin/fusion-rules:12,23`). No fusion rule mentions `paths:` frontmatter: a grep of `rules/context-lean-claude-md.md`, `rules/context-manifest.md` and `bin/fusion-rules` finds none. The manifest controls only what `bin/fusion-rules` emits to fusion agents. It does not control what Claude Code itself loads.

The consequence: a placement run that moves krk's 124 KB section into unscoped `.claude/rules/<topic>.md` files turns the weight helper green. Yet the main session would still load every byte at launch. That is a cosmetic fix. For krk's content, which is mostly invariants of one function each (analysis §3, e.g. `archiv::ersetzen`, `Editormodell::lesen_beginnen`), the right destinations are:

1. **module headers.** These are code, so code-implementer writes them, never the curator;
2. **`.claude/rules/<topic>.md` with `paths:` globs** over the module, which match krk's layout naturally;
3. **`./rules/<topic>.md` behind `rules/context-manifest.yaml`** for fusion-only knowledge. Note: none of krk's 38 packages carries a `Topic:`/`Tags:` line (grep count 0), so topics would resolve only from German slug keywords (`bin/fusion-rules:473-477`). That is fragile.

Step 1's draft says "a topic's rules to a project rule file the manifest loads". As worded it would steer every writer, and the curator, to the cosmetic destination.

**What the curator can and cannot do in krk.** It may create `./rules/` and `.claude/rules/` files when an approved relocation names one (`agents/policy-curator.md:484`). It may not touch `rules/context-manifest.yaml`: exclusion 4 at `:69` and the data exclusion at `:70`. It may not write a module header (code). A relocation whose destination is outside its three surfaces stays `stale` until the owning executor has written it (`:362`). The 20 % blast-radius pause will fire, because the section is 69 % of the file (`:291`).

**What the user has to do in krk afterwards**, as the plan leaves it:

- (a) decide the destination per topic group;
- (b) run `/fusion:curate --placement`, and pass the blast-radius pause and the ledger;
- (c) for module-header destinations, run a code-implementer plan, after which a second curate apply cuts the source;
- (d) if `./rules/` plus the manifest is chosen, have data-implementer write the manifest.

The plan does not write this path down anywhere. The narrative leaves krk's relocation to the user, and that is right. But the user needs to know that (c) and (d) exist. Otherwise the route ends in a pile of `stale` entries.

**Fix.** Add `paths:`-scoped `.claude/rules/` as the named destination for module-bound content. Do this in Step 1's section and in `rules/context-lean-claude-md.md` `### Step 3`. That file is emitted to no agent, so no bound measured in `rules-emission-golden.test.ts` charges it. Add a five-line consumer route to the same file and cite it from the helper's last line. The plan's end-to-end check after Step 4 runs against fusion's own `CLAUDE.md`, which is lean, so it will probably propose nothing and prove little. A scratchpad copy of krk's `CLAUDE.md` (a read-only copy) exercises the relocation entry, the destination and the blast-radius pause.

### 3. Decisions D1 to D3

**D1 (where the rule is emitted): I concur with option 2, with two changes.**

- The options are fairly stated, and the byte arithmetic is right (704 B section, 644 B draft, slack per path verified).
- One option is missing: the structural field in the planner template (§1). It is not an alternative to option 2. It complements it.
- Hidden cost 1: the section cites `rules/context-lean-claude-md.md` with a bare path. In a consuming project a bare `rules/...` resolves against the project's own rule directory, which does not hold that file. `agents/policy-curator.md:26` calls the `$FUSION_PLUGIN_ROOT` prefix "load-bearing" for exactly this reason. The new section must cite `$FUSION_PLUGIN_ROOT/rules/context-lean-claude-md.md`, about +20 B. The net is still ≤ 0.
- Hidden cost 2: the destination wording, see §2.

**D2 (correct the sole-writer claim, or gate executor edits): I concur with option 1.**

- The reasoning against option 2 is correct: the curator's remit allows two reasons and no third (`260916-1311_*`), and adding content is neither.
- Option 3's "observation" is dismissed fairly as a hook concern. But a cheaper form of the same idea, the approval-summary fact (§1), is not listed. With it, the gate that option 1 relies on ("the plan approval is the gate") actually gets the information it needs.

**D3 (the channel for due checks and the weight finding): I concur with option 2, with two changes.**

- Change 1: extend the existing `hooks/session-start.ts` rather than add a new entry point. It already locates the workbench (`findWorkbenchRoot`, `:284`) and emits one `systemMessage` envelope (`emitEnvelope`, `:266-282`). SessionStart already has five commands and two banner sources (`hooks/hooks.json`). A sixth command means a sixth process and a third banner. One envelope with up to three lines is the integral form.
- Change 2: compute the weight **live**, not from a stored `over` count. `bin/fusion-claude-md-weight` took 0.12 s on krk's 179 KB file. A stored count goes stale: after the user relocates, the line stays until someone runs `/fusion:check` again. A live count clears the moment the file is lean. That also removes the `.check-stamps` schema change and most of Step 7.
- The options miss this live variant. The cons are otherwise fairly stated.

### 4. Steps 6 and 7: noise, interactions, test surface, open loop

- **Noise.** Every version bump makes all eleven checks due (`skills/check/SKILL.md:8`). The due line will therefore show after every release, in every project, until `/fusion:check` runs. That is acceptable, because it clears on one action. The plan should say so in D3's cons, which today mention only the krk over line.
- **Interactions.** There is a static banner already: "Orchestrator sessions: run /fusion:setup before any other work." (`hooks/hooks.json`, second SessionStart command). A due line beside it says almost the same thing. Folding everything into one envelope (§3) avoids stacking them.
- **Test surface.** As planned it is about +250 lines (head-room 3 435). With the fold-in and the live weight it is about half that (inference: no separate wiring test, no stamp-field cases).
- **"fusion warns but never acts".** The loop stays open by design, and that matches the narrative ("its relocation stays the user's decision"). It closes only if the warning leads to a route that works. That depends on §2. With the destination fixed and the consumer route written down, the warning is enough. Without them it is the same dead end as today's `/fusion:curate` pointer, one level further on.
- `systemMessage` reaches the user and not the model (`CLAUDE.md` "SessionStart output"). That is the correct audience here.

### 5. The Step 1 cut and the growth figures

**Head-room recomputed independently.** I recomputed it from `surface-growth-bound.test.ts`'s baselines and constants (`AGENT_HEAD_ROOM = 18_000` at `:265`, `SKILL_HEAD_ROOM = 39_260` at `:267`, `TEST_LINE_HEAD_ROOM = 4_835` at `:283`):

| Surface | Head-room |
|---|---|
| agents | 5 536 |
| skills | 2 778 |
| hook-test lines | 3 435 |

All three match the plan. Dispatch-path slack, recomputed as the baseline row minus prompt, emitted rules and `CLAUDE.md`:

| Path | Slack |
|---|---|
| reviewer | 519 |
| implementation-planner | 821 |
| code-implementer | 1 141 |
| policy-curator | 1 724 |

All four match. Both bound tests are green at HEAD (34/34). The section measures 704 bytes (`rules/fusion-workbench-conventions.md:531-541`).

**Is the cut safe? Yes.** Who reads `## Rule-file provenance`:

- Nothing in the shipped text cites the heading. The grep over `agents skills rules bin hooks/lib README*.md docs templates` finds only the section itself.
- The authoring-home table row at `:12` keeps the trigger ("read when writing a rule file").
- The policy-curator reaches the file directly at its Setup step 5 (`agents/policy-curator.md:26`).
- In fusion's own repository the obligation is enforced by `provenance-header-lint.test.ts` anyway.

What is lost is one sentence of the obligation itself ("Every file in a `rules/` directory opens with a `**Provenance:**` line"), which the other agents saw. In a consuming project that matters only when code-implementer creates a project rule file. That would be the module-header-to-`.claude/rules` route of §2, and the plan does not assign that route to it. The risk is low, and the plan's Risks row covers it.

**Margins.** The reviewer path ends at 279 bytes after Step 3. fusion's own `CLAUDE.md` is part of every dispatch-path sum, so any later growth there uses up that margin first. This is not a blocker. It belongs in the step's report.

### 6. Missing, mis-ordered, over-built

- **Missing, Step 5.** `README-hooks.md:349` (the `bin/fusion-claude-md-weight` roster row) says the helper "names `/fusion:curate` as what acts on a finding". Step 5's Files list omits it, so the row will be false after Step 5.
- **Over-built, Step 3.** The test pins that a clause is present in the prompt. The plan says so itself. `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`'s Constraints name that kind of check a "change-detector" and the "decorative-lint problem". Drop the test and keep the clause. That saves about 25 lines and one golden churn.
- **Over-built, Steps 6 and 7.** See §3: one envelope and a live weight.
- **The 1.5 factor (Step 8).** It is a chosen value, like the plan-size ceiling, and the step says so ("a reporting cut-off, never a stop"). That is honest. But the user decides against the delta, not against the flag. My advice: always print the net delta, which is decidable, and keep the flag only if the user wants it. If it stays, state what 1.5 was chosen against. krk's run was 2.03×. No other measured run is cited, so 1.5 has one data point. A corrected sentence can legitimately be longer than the false one it replaces.
- **Order.** It is correct. Steps 4 and 8 have no dependencies and could come first, but sequential execution because of the shared goldens is the right call.
- **Not in scope, worth a note.** Five agents' Setup says "Read `CLAUDE.md` for project context, architecture …" (analysis §2 table, e.g. `agents/reviewer.md:25`). That frames `CLAUDE.md` as the architecture document of record. It is not worth the dispatch-path bytes now, but it is the seed of the framing.

## Recommendations

Ranked by importance, all for implementation-planner to fold into a revised plan before approval:

1. **Fix the destination** in Step 1's section and in `rules/context-lean-claude-md.md` `### Step 3`. Module-bound content goes to the module header, or to `.claude/rules/<topic>.md` *with `paths:` frontmatter*. Unscoped `.claude/rules/` is no relocation. Cite the plugin file with the `$FUSION_PLUGIN_ROOT/` prefix.
2. **Surface the decidable fact at plan approval.** Either the orchestrator's plan-review summary names each step whose `Files:` line names `CLAUDE.md`, or the planner template carries a required `CLAUDE.md:` justification field on such steps. Either one closes the 48 % path where the user actually decides.
3. **Write the consumer relocation route down.** Five lines, in `rules/context-lean-claude-md.md`, which no bound measured in `rules-emission-golden.test.ts` charges: who writes which destination, and that a module-header move needs a code-implementer plan before the curator can cut the source. The helper's last line, or the SessionStart over line, points there.
4. **Steps 6 and 7.** Fold the notice into `hooks/session-start.ts`'s single envelope, and compute the weight live instead of storing `over` in `.check-stamps`. Note the per-release due line in D3's cons.
5. **Step 5.** Add `README-hooks.md` (the `bin/fusion-claude-md-weight` row, `:349`) to Files.
6. **Step 3.** Drop the presence test, or accept it explicitly against `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`'s constraint.
7. **Step 8.** Always print the delta, and let the flag factor be the user's call at approval, stating what it was chosen against.
8. **End-to-end check.** Run it against a scratchpad copy of krk's `CLAUDE.md`, not fusion's lean one.

## Open Questions

- [ ] Does the user want the approval-time fact (recommendation 2) in the orchestrator, in the planner, or in both? The orchestrator option sees every plan. The planner option works also without an orchestrator.
- [ ] Should D3's live-weight variant be added to D3 as an option before the user rules, or recorded as a modification of option 2?
- [ ] `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` is still deferred. This plan is a fresh instance of its question, which the user may want to note there.

## Sources

- fusion: plan, package narrative, D1 to D3 and the analysis as named in the dispatch; `rules/fusion-workbench-conventions.md:1-20,531-541`; `rules/context-lean-claude-md.md:64-78,232-264`; `rules/context-manifest.md:1-30`; `bin/fusion-rules:8-30,467-500,680-700`; `agents/policy-curator.md:26,42,64-70,291,311-319,362,390,395,455,476-492`; `agents/implementation-planner.md:113-124`; `agents/orchestrator.md:223`; `hooks/hooks.json` (SessionStart); `hooks/session-start.ts:1-40,250-290`; `hooks/plan-size.ts:1-60`; `README-hooks.md:228,349`; `hooks/lib/__tests__/surface-growth-bound.test.ts:265-330`; `hooks/lib/__tests__/helpers/growth-bound.ts:154-167`; `hooks/lib/__tests__/fixtures/dispatch-path.baseline`; `skills/check/SKILL.md:8,342-346`; `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.
- Commands: `npx vitest run lib/__tests__/surface-growth-bound.test.ts lib/__tests__/rules-emission-golden.test.ts` (green, 34/34); an independent head-room recomputation (Python over the test's baselines); the dispatch-path slack via `bin/fusion-rules <agent> | xargs cat | wc -c`; `time bin/fusion-claude-md-weight --root <krk>` (0.12 s).
- krk (read-only): no `rules/` and no `.claude/rules/`; 0 of 38 package narratives carry `Topic:`/`Tags:`; `CLAUDE.md` 179 260 B; no `.check-stamps`.
- External: Claude Code memory docs, https://code.claude.com/docs/en/memory, sections "Organize rules with `.claude/rules/`" and "Path-specific rules" (fetched 2026-10-20).

— consultant
