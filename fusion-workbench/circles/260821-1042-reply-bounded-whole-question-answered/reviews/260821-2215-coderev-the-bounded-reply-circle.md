# Coderev — the bounded reply, the question that was asked, and what the corpus paid for saying so

**Date:** 2026-08-21
**Sender:** coderev
**Circle:** circles/260821-1042-reply-bounded-whole-question-answered
**Reviewed-range:** `e764637..de0c6f6`
**Not-opened:** `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/analyses/260821-2020-reply-length-baseline.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_is-claude-mds-register-repair-inside-this-circle.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_may-an-agent-read-the-session-transcripts-as-a-source-of-evidence.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_what-may-the-circles-own-new-clauses-cost.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_which-surfaces-may-this-circle-change.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1801_a_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-2004_o_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/history/260821-1642-orchestrator-session.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/history/260821-1812-planner-the-plan-for-the-bounded-reply.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2010-coder-repair-four-citations-broken-by-activation.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2020-analyst-the-reply-length-baseline-is-frozen.md`, `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/portfolio.md`, `fusion-workbench/shared/history/260821-1536-playmaker-direct-dispatch.md`, `fusion-workbench/shared/issues/260821-1810_o_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md`

`e764637..de0c6f6` is the dispatched `e764637..HEAD` with both ends resolved. One further bound on the list above: `hooks/lib/__tests__/reference-resolution-lint.test.ts` was opened at its header (`:1-240`), its anchor scanner (`:413-474`), its baseline comment stack and assertion (`:820-990`), and not in the 700 lines of case fixtures between and after those.

## Summary

The four shipped files do what the plan set out to do, and the arithmetic behind them holds: the rule file is 84 bytes under its anchor, each profile file is net negative, no heading moved, and `npm test` is green. Three routes out of the length cap are closed. A fourth stands, in the section the plan's own survey declared clear, and it is the second half of the record this Circle claims to close. Two smaller faults are in the new prose itself, and one bounded surface lost half its head-room against a stopping criterion that forbade exactly that.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 1 |

Five records filed to this Circle's issue store. A concurrent `ontorev` pass filed five more against the profile half of the same Turn; one of those, `260821-2204_*_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md`, is a finding I reached independently and did not refile. I appended an `Also seen:` line to it instead.

## Findings by theme

### 1. The cap still has a way out, and the file names it

**`260821-2203_*_a-fourth-route-out-of-the-length-cap-stands-and-the-file-names-it-as-the-remedy.md` — High.**

`rules/user-facing-output.md:95` tells a writer whose plain-text gate exceeds eight lines to move it into `AskUserQuestion`, "which is not line-capped this way". `## Length` caps that surface's parts and never its sum: `:101` the stem and each option label, `:102` each `description`. A four-option gate is permitted 6 + 4 × (4 + 2) = 30 lines against the plain-text gate's 8, for the same decision, on the same screen. `:108`, the sentence step 2 rewrote, says "Every cap above is the budget for the whole output it names" — which is false for those two entries, because they name parts.

The plan surveyed for this and stopped one sentence short. `planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md:22` reads the bullet at `:95` and reports that it "already writes its arithmetic as a total". Its arithmetic does. Its second sentence is the escape.

Consequence for closure: `planning/…:185` says `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md` is closed "both halves". The length half is not closed while this stands, and that record's own reconciliation of 260821-0412 had already observed the `AskUserQuestion` caps are per-field.

### 2. The prose does not pass its own gate

**`260821-2212_*_the-new-information-architecture-clause-ends-in-a-fragment-in-the-file-that-forbids-fragments.md` — Medium.**

`rules/user-facing-output.md:53`, third sentence: "Asked where the acceptance criteria are: the path and the section names, plus one line for each of the two defects you filed." No subject, no finite verb. `:133`, point 3 of the same file's readability gate: "Each point is a grammatical sentence with a subject and a verb."

Second sentence garden-paths: "and gets one line of the reply naming the record" attaches on first read to the intervening "which" rather than to "What you noticed on the way". And "the two defects you filed" asserts a count whose referent the sentence never introduced, against `:135`.

The clause states its rule correctly and an agent will act on it. The Circle's Directive rests on imitation (`_t_circle.md:22-24`), which is what makes an exhibit of the forbidden register in the newest sentence of this file a finding rather than a quibble. A rewrite has 84 bytes of room and the record sketches one at +9.

### 3. A bounded surface moved against a criterion that forbade it, and the fact was never filed

**`260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md` — Medium.**

`surface-growth.golden` went 20 354 → 20 364. Head-room 21 → 11 against a budget of 20 375. The plan's budget table records that surface as "not touched" (`:57`) and its stopping criterion at `:180` requires that "none of the four growth bounds stands closer to failing than it did at HEAD `e764637`". That criterion is unmet and cannot now be met.

Step 6 measured it, named it in full and wrote it into its own history log — the one place `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing` says a defect may not live. No record carried it.

Two things about the ten lines, on the question of whether they were worth it. First, the justification does not hold as stated: `history/260821-2147-coder-the-corpus-is-measured.md:197` says "the gate demands a written attribution for every baseline move". It does not. `hooks/lib/__tests__/reference-resolution-lint.test.ts:919-929` asks only that the numbers be checked and committed with the edit. The comment is that file's convention, which is a good one, and it was a choice that could have been sized as one. Second, the two blocks could have been one: both moves land in a single commit and only the final triple `{1258, 163, 116}` is committed, so the intermediate `{1257, 162, 116}` appears nowhere in history. Green-at-each-step (the user's own call, recorded at `history/260821-2108-…:10-15`) forced a per-step number update; it did not force a per-step comment block.

On sufficiency for a reader a year out, both comments are adequate. Comment 1 names the class that moved, the step, the Circle, the attribution method and the counter-check; it does not name the cited record, but `## Length` still carries the citation, so it is findable. Comment 2 names the exact token and both classes it fed. One thing the four-line trim dropped: "No scanner, exemption or class changed", the clause that says the instrument did not move. It survives in `history/260821-2120-…:76` but not in the file a future reader opens. Four of the file's re-approval blocks carry that formula, so it is a habit rather than a rule; within this pair it is an inconsistency, comment 1 having it and comment 2 not.

### 4. Progress tracking is four steps behind

**`260821-2213_*_the-plans-progress-commit-marked-two-of-six-completed-steps-done.md` — Medium.**

Commit `de0c6f6` is titled "the plan's progress" and marked steps 3 and 5 `[DONE]`. Steps 1, 2, 4 and 6 each have a history log at `**Status:** Complete` and none is marked. The plan header is still `**Status:** Draft`, the filename still `_o_`. A resumed session would re-dispatch step 2, rewriting `## Length` on top of the committed rewrite, and step 4, re-extending AI04 and C06 in four profile files whose budget is spent. The two marked steps are precisely the two that would be skipped.

### 5. Numbers hygiene

**`260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md` — Low.**

`history/260821-2145-…:108-110` defends the hook-test bound with 18 314 lines "across `lib/__tests__/*.test.ts`". The bound counts `hooks/lib/__tests__/**.ts`, helpers included, and stood at 20 364. The step's claim is true and its evidence measures a different set; a reader taking the number for the bound computes 2 061 lines of head-room where there are 11.

## What I checked and found sound

Named because the dispatch asked for a verdict on each, and a verified negative is worth the same as a finding.

- **The three routes are closed by name.** The sketch exemption at `:49` now reads "A sketch counts against the chat length cap like every other line"; the session summary at `:103` states a total as well as a header cap; the closing instruction at `:108` replaces "move material to Details" with cutting, and names the store or the log the cut material goes to. The plan's line-by-line acceptance for step 2 is met.
- **The prefix-resolved heading citation is genuine, not a coincidence.** `scanHeadingAnchors` at `hooks/lib/__tests__/reference-resolution-lint.test.ts:459` is `h === headingText || h.startsWith(headingText)`, `headingsOf` (`:426-431`) strips the `#` run, and `ANCHOR_RE` (`:413`) captures the heading text without it. `## Issue and Decision Filing` is a prefix of `rules/fusion-workbench-conventions.md:453` `## Issue and Decision Filing — MANDATORY`, and `agents/planner.md:65` already cites it in exactly that spelling. The header at `:44-47` documents prefix matching as intended behaviour.
- **The sketch section still states the rule it is now the sole home for.** `:36` states it, `:38` gives the abstract-relational case, `:41-45` the sketch and legend, `:47` the ASCII-versus-Mermaid split, `:49` the corrected cap treatment. C05's pointer names the heading exactly. Step 5's refusal to spend the plan's first candidate was correct, and its stated reason survives inspection.
- **The cut removed duplicates, not the thing itself.** The removed before/after pair stands verbatim in `stilwerk/chat-voice-de.yaml:174-181` (identical German) and in translation at `stilwerk/chat-voice-en.yaml:172-180`. The one non-duplicated clause, the surfaces where the pattern occurs, was moved to gate point 2 at `:132` and reads naturally there. "The principle is language-independent" survives at `:32`; "name the referent" at `:19` and `:135`; "drop the em-dash" at `:132`; "spell out the count" at `:135`. Nothing load-bearing went with what did not move.
- **The arithmetic reproduces.** `wc -c rules/user-facing-output.md` is 20 060 against 20 144 at the anchor, −84. `bin/fusion-prose-metric` reads 1 em-dash over 2 634 prose words, 0.4 per 1000 against a ceiling of 1. `rules-emission.golden` moved by exactly the size substitution in all fifteen agent blocks and nothing else, 60 changed lines. `workbench-citation-lint.test.ts` is green after my own records landed.
- **The file's own Example 1 still complies with the cap it now states.** 18 rendered lines against the new 25, 8 before the `**Details:**` anchor against the 10.

## Two observations that are not defects

- **`C04` still says "Details go to the end or to a file, not the opening lines"** (`stilwerk/chat-voice-en.yaml:43`, `chat-voice-de.yaml:44`), two lines after pointing at `## Length` for the caps. Read strictly it is placement, which `## Information architecture` point 4 also mandates, so it contradicts nothing. Read in context it is the last place in the corpus where "move it to the end" sits directly under a shortness instruction. It was outside step 4's scope and is worth a look by whoever next opens those files.
- **The stated reason for shortening the heading citation does not survive measurement, though the choice does.** `history/260821-2120-…:29-30` gives as a third reason that the shorter spelling "keeps an em-dash out of the file". `bin/fusion-prose-metric` does not count an em-dash inside an inline code span; I checked with a two-file fixture, one carrying the full heading in backticks and reading 0, one carrying a bare em-dash and reading 1. The other two reasons, prefix resolution and the `agents/planner.md:65` precedent, are sound and carry the choice on their own.

## Open obligations before this Circle closes

- `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md` is still `_o_` with no `Resolved:` note, and the plan makes steps 2, 3 and 5 responsible for closing it. Finding 1 says its length half is not yet closable.
- The stopping criterion on the four growth bounds cannot be met as written. The closure note should say what happened rather than repeat it.
- The plan owes `[DONE]` on four steps, then `**Status:** Complete` and `_o_` → `_c_`.

## A fault of my own, recorded here and on its class record

Filing my first two records, I ran `sed -i '' … *.md` over this Circle's `issues/` directory to normalise citation markers in my own files. A concurrent `ontorev` was filing into the same directory at the same time, and all seven files now carry my write mtime. The five I did not author are untracked, so no original exists to compare against; the only substitution the command could make in them is `260821-1805_o_plan-reply` to `260821-1805_*_plan-reply`, which is the wildcard form the conventions prescribe, so nothing broke and nothing was lost. It was still not mine to write. Appended as `Also seen:` to `shared/issues/260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`, which is the same class.

## Recommended sequencing

**Before the Circle closes.** Finding 1, because the closure note otherwise claims a record closed that is not. Finding 4, because it is a two-minute edit that a resumed session depends on. Finding 3's disclosure, because the closure note has to state the growth rather than deny it.

**Not a release blocker.** Finding 2 and finding 5 are corrections to shipped prose and to a workbench record. Neither affects behaviour, and both are cheaper to take together with whatever else opens those files next.
