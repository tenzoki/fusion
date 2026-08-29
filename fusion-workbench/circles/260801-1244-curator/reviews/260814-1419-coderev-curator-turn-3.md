# Code review — Turn 3 of Circle `260801-1244-curator`: the curator's first real run, and the 28 corrections it landed

**Date:** 2026-08-14 14:19
**Sender:** coderev
**Circle:** `260801-1244-curator`
**Reviewed-range:** `5c843e6..0301909`
**Not-opened:** `260814-1332-curator-run.md` (2 633 lines — read by section and by search, not end to end: §2, §6 tail, §7, §8, §9 with its per-entry table, and ledger entry L24 in full), `fusion-workbench/orchestrator-events.jsonl` (1 418 lines — the range diff and the tail read, not the whole file), `260813-2345-orchestrator-session.md` lines 1-127 (Setup snapshot, Turn 1, the Phase 0b plan gate — unchanged in this range; the Turn 2, Resume and Turn 3 sections read in full), `260814-1128_*_the-curators-frontmatter-description-still-carries-the-unqualified-gate-absolute.md`, `260814-1128_*_the-justification-dutys-prose-describes-a-firing-path-the-floor-based-assertion-does-not-have.md`, `260814-1128_*_three-byte-figures-and-one-agent-count-beside-the-arming-were-left-stale.md`, `260814-1200_*_the-proof-run-cannot-be-dispatched-from-the-session-that-built-the-agent.md`, `260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md` (rename only in this range)

**On the nineteen decision records.** Each was opened as its complete diff, and the full text of all nineteen was read programmatically — every path citation extracted and resolved against the stores, and every literal marker compared with the marker the target carries on disk. Not read end to end as prose. Both scripted passes are reproduced under *What was verified, and how*.

**On the ten files Turn 2 carried.** All ten were opened. Eight in full: `portfolio.md`, `260814-0738-shaper-curator.md`, `260814-0845-planner-curator.md`, `260814-0857-conceptrev-plan-curator.md`, both `260814-1001` shared issues, and both playmaker dispatch histories. Two partially, as declared above. Nothing on that list is carried forward except the two partial reads.

---

## Summary

The 28 corrections are true. I re-derived every claim the four `CLAUDE.md` edits make against the mechanism each one describes, resolved every citation in all nineteen decision records against the stores, and found no correction that replaces a wrong claim with a wrong claim. The golden fixture moved sizes and totals only — no path set, no emission order, no agent's file list. `npm test` is green at 1 030 tests.

Six findings, none in behaviour. The load-bearing one is a correction that is not false but is materially incomplete: the layout tree's consumer column now names `bin/monitor` alone for three surfaces that four `hooks/lib` modules also read at a fixed path, on a line whose own prose promises the reader that the column names every consumer.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 4 |
| Low | 2 |

Four are filed under `circles/260801-1244-curator/issues/` and two under `shared/issues/`, all at stamp `260814-1419`. The split is the Origin Rule: two of them concern commit `ae21c87`, which landed inside this Turn but was not caused by this Circle's Directive.

## What was verified, and how

- **The suite.** `cd hooks && npm test` — exit 0, 49 files, 1 030 tests. No `RULE-TEXT BUDGET` report for any role.
- **The four `CLAUDE.md` corrections, each against its mechanism, not against its ledger entry.**
  - The `hooks/` row's new clause about the config-diagnostic loop sitting above the Bash return: correct. `hooks/guard.ts:238-241` is the `for (const diagnostic of config.diagnostics)` loop; `hooks/guard.ts:283-286` is `if (isBash) { allow(); return; }`. The comment block above the loop states the departure in as many words.
  - `rules/decision-record-examples.md` as one of the five always-on rules: correct. `bin/fusion-rules:394`, unindented `emit_if_exists`.
  - The always-on floor paragraph's replacement of `30 588 bytes, about a third` with a derivation: correct and now non-staling. Measured today, the three indented `emit_if_exists` files (`design-diagrams.md`, `circle-records.md`, `workbench-stash-and-lock.md`) total 30 652 against an always-on floor of 94 448 — 32.5 %, "about a third again".
  - The `/fusion:next` symptom row, rewritten from an error claim to a working-as-designed claim: correct. `skills/next/SKILL.md:65-75` is the only short-circuit and it fires on an empty or absent `circles/`. With every record terminal the skill dispatches playmaker, renders the recommendation as `(none)` (`skills/next/SKILL.md:120`) and skips activation ("If none exist, skip Step 6 entirely", `:200`). The cited span `64-76` is off by one at each end and encloses the block.
- **Citation resolution across all nineteen decision records** — every `circles/…` or `shared/…` `.md` token extracted, exact-matched, then glob-matched with `_*_` expanded to `_?_`: **0 unresolvable**.
- **Stale literal markers across the same nineteen** — every citation still carrying a literal marker compared against the marker its target holds on disk: **0 stale**. Nineteen literal citations survive and all nineteen are accurate today.
- **The golden fixture's movement.** Two sizes across every block: `fusion-workbench-conventions.md` 52 027 → 52 549 (+522) and `workbench-stash-and-lock.md` 12 952 → 13 030 (+78). Seventeen agent blocks before and after, same order, same file list each. Growth-bound arithmetic re-derived independently: core floor 86 573, budget 98 573, emitted 87 095, head-room 11 478 — which is the executor's "roughly 11 500".
- **The prose correction in `2a8a2f7`.** The new statement that a role's floor is `RULE_BASELINE` summed over its files, so editing a rule file moves what the role emits and not what it stands on, is right at `hooks/lib/__tests__/rules-emission-golden.test.ts:653` (`files.reduce((n, f) => n + (RULE_BASELINE[f.rel] ?? 0), 0)`) and at `:1061` (`if (floor <= RELEASE_CAP) continue;`).
- **The two new defect records, checked against their own evidence.** `bin/fusion-rules:186` carries the ten-agent prose set; the `Long-form prose vs short-form` enumeration is present in nine prompts and absent in `agents/curator.md`; `bin/fusion-rules curator` does emit `default-voice-en.yaml`. `emit_voice_profile()` prints a bare path on both branches with no fallback signal. Both records are accurate.
- **The corpus claim behind the new decision record.** 85 decision records on disk today (84 at the survey's HEAD, plus the record itself): 57 `_i_`, 14 `_a_`, 10 `_o_`, 4 `_d_`, **0 `_s_`**. The Directive's question is answered as the record states it.

## Findings by theme

### A correction that is incomplete rather than wrong

**1. The layout tree's consumer column now names only `bin/monitor` for three surfaces four `hooks/lib` modules read. (Medium)**

Ledger entry L24 replaced `hooks/tracker.ts:33-36, bin/monitor:72-75` on four rows. Removing the line numbers was right — `sed -n '33,36p' hooks/tracker.ts` is header prose, as the entry's own evidence shows. But three rows lost their hooks consumer entirely, and the paragraph two lines below the tree reads *"Each is read at a fixed root-relative path by the consumer named beside it in the tree, and none of those consumers has a fallback path — relocating one into a Circle or into `shared/` breaks it silently."*

`hooks/lib/state-drift.ts:97-98` constructs both `agentstate.yaml` and `orchestrator-events.jsonl`; `hooks/tracker.ts:96-101` imports that module and runs the measurement on every guarded tool call. `hooks/lib/review-coverage.ts:125`, `hooks/lib/churn.ts:123-125` and `hooks/lib/staging-drift.ts:175-180` name the same three paths as fixed literals.

The entry's evidence is `grep … hooks/tracker.ts`, scoped to one file, where the finding is correct. The same entry then widened the search for the fourth row and added `hooks/lib/events.ts` and `hooks/lib/guard-state-file.ts` to `.guard-state/`. One row of four got the wider search. That inconsistency inside a single ledger entry is what makes this a defect rather than a defensible cut.

Issue: `260814-1419_*_the-layout-trees-consumer-column-now-names-only-bin-monitor-…`

### A half-landed fix against an open issue

**2. Three Plane files entered the tree; neither per-surface argument below it was extended. (Medium)**

Ledger entry L23 added `plane.config.yaml`, `.plane-map.json` and `.plane-outbox.jsonl`, which is what open issue `260810-0410_*_…` asked for, and the anchoring is real (`bin/fusion-plane:236-238`). Two paragraphs below the tree range over the root-anchored surfaces and neither moved: the per-surface justification still argues six cases, and `### Which of them a tracked workbench tracks` still splits the set in two without placing any of the three. `rules/critical-stance.md` §4 is the section's own standard.

Before the addition the three were absent everywhere, consistently. Now they are in the tree and out of the split, so the file states a case split that visibly misses three of its own entries — and `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` is still `_o_` with half its fix landed.

Issue: `260814-1419_*_three-plane-files-entered-the-layout-tree-…`

### A shipped change that reaches nothing here, and is recorded nowhere

**3. The chat-voice profiles were tightened in `stilwerk/` and not in the workbench copies agents load. (Medium)**

`bin/fusion-rules` emits `./fusion-workbench/stilwerk/…` (`emit_voice_profile`, `:296-321`), not `stilwerk/…`. The two chat profiles now diverge (7 358 / 7 353 and 6 800 / 6 801) while both long-form profiles are byte-identical, so the divergence is exactly `ae21c87`. Every agent dispatched here since — the curator's own run included — read the old caps. `/fusion:setup` re-ran at 13:11, eight minutes after the commit, and did not repair it: its copy is idempotent and its source is `~/.fusion/stilwerk/`, not the work tree.

The class is general. Every asset setup copies into the workbench is edited in the work tree and consumed from the workbench, with nothing that notices a disagreement — unlike `rules/`, which `bin/fusion-plugin-cwd` covers.

**And the commit is attributed to no task.** `grep -rn ae21c87 fusion-workbench/` returns five hits, every one of them the curator citing it as the HEAD it read against. No `commit` event, no `orchestrator-live.md` row (both neighbours `2a8a2f7` and `e101761` have one), no Circle Turn-log entry, no session-history sentence. A shipped-asset change with no task, no event and no entry is one no review is dispatched against.

Issue: `260814-1419_*_the-shipped-chat-voice-profiles-changed-…`

**4. The tightened caps contradict `rules/user-facing-output.md` `## Length`. (Medium)**

`rules/user-facing-output.md:99,102` say 8 and 12; the profiles now say 6 and 8. Both files are always-on for every agent. Nothing states precedence, and `rules/user-facing-output.md:19` records the design intent that the chat profile does not carry targets that "would fight the caps in `## Length`". A 7-line gate prompt satisfies one surface and violates the other.

The same edit also diverged the German from the English beyond translation — the German dropped "or to a file" and "not the opening lines" and added "Klare Formulierungen, kein Jargon", which has no English counterpart — and left trailing whitespace at `stilwerk/chat-voice-de.yaml:43`. The commit message covers only the caps.

Issue: `260814-1419_*_the-tightened-chat-profile-caps-contradict-…`

### Citation and count hygiene

**5. Nine `_o_` citations were left literal on lines where their siblings were starred. (Low)**

All citations resolve today, so nothing is broken. But `_o_` is the one marker guaranteed to move, and in two records the pass starred one `_o_` pointer and left another literal *in the same `**Cross-references:** ` line*, with no distinction the rule's test ("a pointer loses nothing, a statement loses its content") can draw between them. Nothing required these rewrites at all — the enforced scope is shipped text and `portfolio.md`, not workbench records — which is what makes a half-applied convention worse than none: the next reader cannot tell which literals are deliberate.

Issue: `260814-1419_*_nine-open-marker-citations-were-left-literal-…`

**6. The T8 history states eighteen agent blocks and five rule files; there are seventeen and three. (Low)**

`260814-1352-coder-golden-regeneration.md` says the sizes moved "across all eighteen agent blocks" (the fixture holds 17, matching 17 agents) and that the curator "edited five project rule files" of which "three of them are emitted" (three files, two emitted) — then states the correct fact about the third two paragraphs later. The task itself was performed and verified correctly; only the counts are wrong.

Issue: `260814-1419_*_the-golden-regeneration-history-states-eighteen-agent-blocks-…`

## The four things the dispatch asked to be judged

**1. Are the 28 corrections true?** Yes, on every one I could reach. The four `CLAUDE.md` edits were each re-derived against the mechanism rather than against the ledger, and all four hold. The nineteen decision records resolve completely. The three rule-file edits are individually true — `bin/fusion-paths:267` carries the `[ ! -d "$WORKBENCH/circles/$CIRCLE_NAME" ]` branch verbatim; `bin/fusion-paths:236-239` does delegate to `bin/fusion-workbench-root` and both stash skills call `bin/fusion-paths` at their first step; the voice-profile sentence now describes what `emit_voice_profile()` actually does. **No correction replaces a wrong claim with a wrong claim.** Finding 1 is the nearest miss and it is an omission, not a falsehood.

The pass's method deserves naming, because it is the reason the count is zero: it extracted every before/after string programmatically from its own ledger after a hand transcription failed the staleness check on the first attempt, and wrote nothing on that attempt. That check caught a curator error rather than a drifted file, which is the case it was written for.

**2. The citation rewrites.** The wildcard form is the one `rules/circle-records.md` `### Citation form in the portfolio` defines, and no rewrite starred a marker that was being named rather than pointing at a file — I checked the ones where the surrounding text makes a state claim, and in each the letter was kept (`260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` beside "now closed by `26ea3c3`", `260809-1101_c_` beside "closed by the same commit"). The distinction was applied in the right direction. Two things sit beside that, and only one is a defect. The defect is finding 5. The other is scope, and it is worth stating rather than filing: the rule's heading is *in the portfolio*, and `260806-0015_*_zitierform-fuer-workbench-records.md` scopes its answer to *ausgelieferte Texte*. `hooks/lib/__tests__/reference-resolution-lint.test.ts` enforces the grammar over shipped text and `portfolio-citation-form-lint.test.ts` over `portfolio.md`; a workbench decision record is in neither. So the pass extended a convention into an unenforced surface — defensibly, but that is why its unevenness has no rule to appeal to.

**3. `agents/curator.md` and the golden fixture.** `agents/curator.md` changed one clause of the frontmatter `description`, from "nothing is written before a user gate" to "no existing statement is changed before a user gate", which is the wording the Turn-2 defect record proposed and which agrees with `:16`, `:168` and `## Scope`. No colon introduced; `claude plugin validate` was run by the executor and the suite is green. The fixture moved sizes and totals only: 17 blocks before and after, identical order, identical file list per agent, every changed line a size or a total. Nothing structural moved.

**4. The two defect records and the one decision record.** All three state what they claim, verified against their own cited evidence. The decision record is genuinely a decision and not a defect: it puts a real choice point — what marks an implemented decision whose implementation was later deleted — with four options that are mutually exclusive, a constraint list, a labelled recommendation, and `inference:` / `speculation:` markers on the two claims that earn them. Its resolution is "decide and record", not "go fix it". Filing it rather than answering it is what `agents/curator.md` `## Contradictions` requires when the two positions are both defensible, and both positions are cited to the text that holds them.

## The coverage note the dispatch left to my judgement

**Already filed twice, so I filed nothing.** `bin/fusion-review-coverage` reports `260814-0857-conceptrev-plan-curator.md` as `UNUSABLE (no **Reviewed-range:** line)`, and will report every conceptrev file that way forever. The mandate is deliberately two-prompt: `hooks/lib/__tests__/review-coverage-mandate.test.ts` fixes `REVIEWER_PROMPTS` to `coderev` and `ontorev`, and a conceptrev run evaluates one document's diagrams and has no commit range to state — its own header carries `**Target:**` instead. The helper globs the store with no sender filter.

So the defect is in the helper, not in that file and not in `agents/conceptrev.md`. Two open records already say so:

- `260811-1145_*_conceptrev-review-files-are-scanned-and-trigger-the-coverage-report-though-no-mandate-covers-them.md` — the fuller one. Names both halves (the scan in `hooks/lib/review-coverage.ts` and the trigger in `hooks/tracker.ts`), and proposes filtering on the `<sender>` segment the filename convention already mandates, held in one exported constant the mandate test asserts against.
- `260814-1012_*_a-conceptrev-review-is-counted-unusable-by-the-coverage-helper.md` — filed three days later, three candidate resolutions, first of which is the same fix.

The second is a duplicate of the first and covers less. Whoever picks this up should close it against `260811-1145_*_conceptrev-review-files-are-scanned-and-trigger-the-coverage-report-though-no-mandate-covers-them.md` rather than working both.

## Cross-cutting observation

**The Turn's own subject is where its findings are: a claim in prose that nothing checks.** Findings 1, 2 and 6 are each an enumeration or a case split that a command falsifies — the exact tier-1 shape the curator's 28 corrections all had. Two of them were *produced by* the correcting pass, and both for the same reason: a search scoped one directory too narrowly, or a paragraph edited without the two paragraphs that range over the same set. That is not an argument against the run; a pass that landed 28 verified corrections and introduced two under-complete ones is far ahead. It is an argument for the thing the Turn-2 review already named and the run's own candidate C01 declined to act on — that the surfaces which carry counts and enumerations need a gate, not a careful reader.

**The measured half held everywhere.** Every claim in this Turn that a mechanical gate covers came out right: the golden pinned the fixture to two sizes across seventeen blocks, the growth bound held at 11 478 bytes of head-room and was checked in both directions, the enumeration lint held, `claude plugin validate` held. All six findings sit in text no parser reads.

**One thing the run did honestly that is worth naming.** Candidate C01 measured 16 decision records in the editable surface whose `**Status:**` header contradicts their filename marker, reported it, and declined to act because deciding which of the two is right is the reconciler's ground-truth work. I re-measured it across the whole workbench at 34 of 85, and the two open records it cites (`260811-2146_*_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`, `260812-1232`) do carry the class. The declining is correct and I am not refiling it.

## Is the Directive met?

**Both halves are now met, subject to one qualification the run states itself.**

Turn 2 judged the build half met and the proof half not begun. The proof half has now run. The Directive's own test is that the run "either produces the supersessions that were never recorded or establishes with a comparison count that there are none", and the run established the second: across the citation-linked pairs its stated selection rule reached inside `$SCAN_DECISIONS`, no living record overturns another, and four of them say so in their own text. It did not claim a completeness the corpus size forbids, which is what plan question 10 asked of it.

The qualification is the run's own, and it is in the record rather than glossed: the editable surface was 46 of 84 records, and roughly eleven affected records sit in closed Circles no run without that Circle in scope can reach. So "there are none" is established over the surface the rule reached, and the corpus-wide claim is filed as an open decision rather than asserted.

## What I would want fixed before it closes

1. **Finding 1.** It is the one correction that leaves a shipped rule file saying less than it promises, in the file every agent loads on every dispatch, about the surfaces whose whole documented property is that moving one breaks something silently.
2. **Findings 3 and 4 together, and in that order.** Decide what the caps should be before deciding how they reach an agent; fixing the plumbing first ships whichever number happens to be in the file.
3. **Finding 2**, which also lets `260810-0410` finally close.
4. **The three Circle issues still open from activation** — `260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`, `260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`, `260814-0920_*_the-turn-log-drift-row-reports-drift-for-the-whole-duration-of-every-turn.md` — unchanged from Turn 2's list and still standing. The first two are records contradicting themselves inside the Circle whose subject is records contradicting themselves.
5. **Findings 5 and 6**, ordinary cleanup, any time.

One thing I am not filing and will name, because it belongs to the release process rather than to this Circle. `.claude-plugin/plugin.json` reads `8.2.0` and `~/.fusion` was updated to `8.2.0` at 13:11, after which three further commits changed shipped files under the same version number. The installed 8.2.0 and the source 8.2.0 are no longer the same bytes, and nothing in the version surface says so. That is the residual `CLAUDE.md` `## Release process` already documents in its "between releases" paragraph, arriving from the other side.

---

## Reconciliation note (reconciler, 2026-08-14, HEAD `18173e1`)

**All six findings were re-checked against the tree and all six still stand.** No finding is closed
by this pass. Findings 1 and 2 are unchanged in `rules/fusion-workbench-conventions.md`; finding 3
was re-measured (`stilwerk/chat-voice-de.yaml` and `chat-voice-en.yaml` both differ from the
workbench copies, while both `default-voice-*.yaml` are identical); findings 5 and 6 are unchanged
in their cited files.

**One count in this document contradicts the rest of it.** `## Summary` says "Five findings, none in
behaviour" and `## Totals` says "Three are filed under `circles/…` and two under `shared/issues/`".
`## Totals` itself sums to six (4 Medium + 2 Low), `## Cross-cutting observation` says "All six
findings", `## Findings by theme` numbers six, the commit message of `18173e1` says six, and six
issue files exist at stamp `260814-1419` — four under `circles/260801-1244-curator/issues/` and two
under `shared/issues/`. So the split is four and two, not three and two. Filed as
`260814-1450_*_the-turn-3-review-states-five-findings-and-a-three-two-split-while-carrying-six-and-a-four-two-split.md`.
Findings are not rewritten by a reconciliation pass; the note is left beside them.

**Correction appended 260824** (ontocoder, plan step 5 of `260824-1905_*_plan-close-every-open-defect.md`). The two summary counts the note above describes were corrected in place on
260824: `## Summary` now opens "Six findings" and `## Totals` now says "Four are filed under", so the two
sentences a reader meets first agree with the table, the numbered findings, the commit message and the
disk. No finding was touched. Filed as
`260814-1450_*_the-turn-3-review-states-five-findings-and-a-three-two-split-while-carrying-six-and-a-four-two-split.md`.
