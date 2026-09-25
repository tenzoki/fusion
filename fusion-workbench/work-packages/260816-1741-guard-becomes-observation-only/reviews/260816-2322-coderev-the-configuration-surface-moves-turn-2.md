# Code review — the compliance guard becomes observation-only, Turn 2

**Date:** 2026-08-16
**Sender:** coderev
**Reviewed-range:** `3c2e1c6..1d1d3a3`
**Not-opened:** none
**Circle:** `260816-1741-guard-becomes-observation-only`
**Plan under review:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, steps 5b, 7a, 7b, 8 and 9

## Summary

The configuration move is correct and the migration works. Verified end to end against a scratch
consuming project in three states: a project carrying only the old file is told exactly what to
copy and where, keeps its budget when it does so, and stops hearing about it when the old file
goes. The compiled tree rebuilds byte-identical, no production export lost its last caller this
Turn, and the suite is red at exactly the three files another step owns. Seven new defects come
out of the pass; none of them asks for a change to the code this Turn wrote.

The dominant pattern has moved. Turn 1's was *a step reasons about a symbol's last consumer and
the consumer is somewhere the step never grepped*. Turn 2's is one step further out: **the
executors' departures are recorded and the plan's own instruction text is not, so the next reader
of a step gets the instruction and has to find the correction underneath it.** Findings A, B and G
are three instances, and B is the one that costs something if it is applied as written.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 5 |
| Low | 2 |

All seven are filed in this Circle's issue store under the Origin Rule; every one arose from
executing this Directive. Nothing went to the shared store.

## What was verified and holds

Stated because a review that only lists defects leaves the reader unable to tell a checked claim
from an unchecked one.

**1. The migration completes, on the diagnostic text alone.** A scratch project with a workbench
marker, `fusion-guard.json` carrying `{"orchestrator":{"maxTurns":12}}` and no `fusion.json`:
`bin/fusion-turn-budget` printed `max_turns=5` on stdout and the full retired-file sentence on
stderr; an `Edit` through the compiled `hooks/dist/guard.js` wrote one `guard_advisory` carrying
the same text and one `guard_allow`. Writing `{"orchestrator":{"maxTurns":12}}` into `fusion.json`
took the budget to 12 with the old file still present; deleting the old file silenced the
advisory. The text names the key, names the destination and states the order, and the order is the
half that matters — a reader who deletes first loses the value. This is the single most expensive
thing in the Turn and it is right.

**2. The budget's survival is structural, not lucky.** `PROJECT_CONFIG_FILENAME` is the sole
filename in the loader (`hooks/lib/config.ts:138`) and the only path the project layer is read
from (`:454-458`); the retired file is `existsSync`-probed and never parsed (`:460-472`), so
nothing in it can reach a setting. The probe and the read resolve against the same root, and both
go through `findWorkbenchRoot()`'s upward walk, so a session started in a subdirectory is not a
hole here. I looked for a path by which a budget is silently defaulted without the advisory
firing and found none: old file present is always named; no old file and no `fusion.json` is a
project that configured nothing; a wholesale `mv` of the old file to the new name keeps the budget
and earns three retired-key advisories instead. Six cases in `config.test.ts` and four in
`guard-project-config-integration.test.ts` pin it, and the ordering case — retired file named
before a complaint about the file that *is* read — is asserted rather than assumed.

**3. The template's five notes are sufficient on their own, and the byte-identity pin holds.**
A reader of `templates/fusion.json` alone learns what it configures (`_what`, `_turnBudget`), that
there are two layers and that the plugin layer is gone (`_override`: "There are TWO layers, this
file and those defaults"), and what to do about a leftover `fusion-guard.json` in the right order
(`_retired`: "COPY YOUR TURN BUDGET ACROSS FIRST … Then delete fusion-guard.json"). `_gitTracked`
keeps its argument, which was never the guard's. `config.test.ts`'s three template cases pass:
the seeded template produces no diagnostic and merges to bare defaults, it declares no
`orchestrator` key, and the root copy is byte-identical to the template outside `PROJECT_SET_KEYS`
— including the anti-vacuity assertion that the cut is a no-op on the template itself
(`config.test.ts:751`).

**4. `hooks/dist/` is clean.** Rebuilt into a copy and `diff -rq` against the committed tree
reports identical; twelve sources under `lib/`, twelve `.js`, twelve `.d.ts`, no orphan.

**5. No production export lost its last caller this Turn.** Enumerated every `export` in
`hooks/*.ts` and `hooks/lib/*.ts` and its consumers, at HEAD and at `3c2e1c6`. The orphan set is
identical apart from the five symbols that went with `config.ts`'s reduction; `isFusionPluginRoot`
gained a consumer rather than losing one. On the harness side one export, `TEST_DIST`, lost both
its external consumers (`legacy-halt-clearing.test.ts` re-pointed, `clear-halt-concurrent-halt.ts`
deleted) but is still used internally at `guard-harness.ts:194`, so it is not dead.

**6. Nothing else in the tree reads the changed diagnostic prefix.** `grep -r 'Guard configuration'`
over the repository returns nothing. The 7a note's claim holds.

**7. The suite is red at exactly what the dispatch says is not mine.** 3 files / 5 cases:
`derivable-enumerations-lint` (1, the `hooks/lib` table still lists `escalation.ts` and
`project-relative.ts`), `reference-resolution-lint` (2, 29 dangling references across 7 files plus
the `BASELINE.paths` pin at 1122 against 1093 resolved), `surface-growth-bound` (2, the `skills`
golden and five stale hook-test entries). No file outside those three is red.

## Findings by theme

### Theme 1 — a step's instruction text and the executor's departure from it are two documents (3 findings)

**A. Medium — `hooks-wiring.test.ts` was in step 9's Files list, was not edited, and its comment
justifies the Bash matcher by a mechanism removed on 2026-08-12.**
`260816-2315_*_hooks-wiring-test-was-in-step-9s-list-was-not-edited-and-justifies-bash-by-a-mechanism-removed-on-260812.md`

Step 9 says the file "keeps its Bash assertion and gains the current reason for it, the
configuration diagnostic loop". It is not in the Turn's diff at all, and step 9's execution note
records three departures, not four. `hooks-wiring.test.ts:33-40` still says Bash is wired "because
it is where the BEFORE-fingerprint of the protected paths is taken", and that fingerprint went on
2026-08-12. It is not merely a stale comment: this Turn made the diagnostic loop the whole of the
v10 migration, that loop reaches a project through the Bash surface, and these two assertions are
now the only thing pinning the wiring. The comment above them tells the next reader the reason for
that wiring is a mechanism they can verify does not exist.

**B. Medium — step 13's `Retired:` list is wrong in three of its four entries, and its `_i_` scope
cannot reach the one record whose question this plan deletes.**
`260816-2316_*_step-13s-retired-line-list-is-wrong-in-three-of-its-four-entries-and-its-marker-scope-misses-a-fifth-record.md`

**This is the dispatch's question 7, and it is the same shape as Turn 1's two — an assertion about
what a removal orphans, made without grepping where the subject actually lives.** Of the four
records step 13 names, two already carry `Retired: 60c9cd8` lines added on 2026-08-12
(`260803-1419_i_*:123`, `260802-1912_i_*:95`), one is right (`260804-1631_*_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md`, `guard.enabled`), and
one **must not** get the line: `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`'s answer is the per-leaf merge and the
drop-equals-absent equivalence, which is live code at `hooks/lib/config.ts:479-486` and is cited
three times in that file's own comments as the obligation the surviving shape rests on (`:46-49`,
`:70-73`, `:363-367`). The step's safeguard makes it worse rather than better: "re-derive the list
… `grep` the decision stores for the identifiers this plan deletes" returns `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` with the
highest hit count in the store, because its `## Question` names five deleted identifiers.

A fifth record falls outside the step's three transitions entirely.
`260804-1632_*_should-findrelevantdecisions-fold-case-…` is `_d_`, its question was deleted with
`findRelevantDecisions` at 7a, and `hooks/lib/paths.ts:36-41` already says the question "can no
longer be decided either way". The information is in the tree; the step's marker scope cannot see
it.

**G. Low — step 11's line-scoped Changes text misses two stale lines in files it already opens.**
`260816-2321_*_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md`

`agents/orchestrator.md:122` is scoped to "(filename)" and carries three errors, not one — the
filename, a three-layer merge that is now two, and "exactly as every guard setting is" naming a
class with no members. `README-agents.md:169` has the identical three and step 11 names all of
them there, which is what makes the narrower scoping look deliberate. `bin/monitor:188` is a
second stale comment in a file step 11 opens for `:212`, illustrating the advisory class with
`fusion-guard.json` and the retired *leaf* `guard.protectedPaths`, both wrong now. Neither line is
reachable by `reference-resolution-lint` — a bare filename is not a path and a key is not a file.

### Theme 2 — the migration's channel, as distinct from its text (1 finding)

**C. Medium — the retired-file diagnostic's one chat-visible channel is a repeat mandate scoped to
dropped keys, and a retired file is not a drop.**
`260816-2318_*_the-retired-file-diagnostics-one-chat-visible-channel-is-a-repeat-mandate-scoped-to-dropped-keys.md`

The text is right (point 1 above). What is unsettled is who reads it. `guard_advisory` has exactly
one consumer in the tree — `bin/monitor`'s warnings panel — and nothing in any agent prompt or
skill body reads `.guard-state/events.jsonl`. So the per-guarded-call channel, chosen over a Setup
step precisely because it reaches a project that never runs Setup, delivers into a JSONL a human
sees only by opening the dashboard. The one channel that puts the sentence in front of a user in
chat is `bin/fusion-turn-budget`'s stderr, and the mandate that repeats it,
`agents/orchestrator.md:132`, reads "puts on stderr **anything the configuration loader had to
drop** — a budget that is not a whole number of 1 or more is dropped … Repeat any such line". A
retired file is not a drop; nothing was dropped and the file was never read.

Worth saying plainly: this may not need a mechanism at all. The budget is read only at Setup, so a
project that never runs Setup loses nothing by not hearing about it, and the fix is then one
sentence in a file step 11 already opens. That question is recorded nowhere, and the finding asks
for it to be answered rather than for a channel to be built.

### Theme 3 — a re-pointed test that reads as a guarantee and is not one (1 finding)

**D. Medium — the `answer`-site case in `hook-fail-open.test.ts` cannot fail on the violation its
describe block names.**
`260816-2319_*_the-answer-site-case-in-hook-fail-open-cannot-fail-on-the-violation-its-describe-block-names.md`

**On the dispatch's question 5, split two ways.** The executor's own catch — the second case,
asserting two `[guard] Error:` markers rather than one — **is verified and its reasoning holds
exactly as stated**: `failOpen` writes one marker and deliberately swallows its own emit failure
(`fail-open.ts:180-191`), while the real path writes one from `bestEffort` in the diagnostic loop
and a second from `answer`'s guarded report. One marker versus two is the whole discriminator, and
`{}` plus exit 0 alone would have been satisfied by both worlds.

The case beside it, `hook-fail-open.test.ts:274-289`, is the one that went vacuous and was not
caught. Its four assertions — stderr marker present, verdict `{}`, exit 0, `events.jsonl` empty —
all pass identically whether `guard.ts:202` puts the verdict before the report or after it,
because when the only verdict is `{}` the fail-open tail reconstructs the same output. Before this
Turn the same case asserted `decision === "block"`, which a violation would have lost. The marker
trick does not transfer: this path has one report and therefore one marker in both worlds.
`inference:` I could construct no observable that separates them, so the honest response is
probably a comment naming the bound rather than a better assertion.

The other two re-pointed surfaces are sound. `legacy-halt-clearing.test.ts` seeds a real
`haltActive: true`, asserts the file byte for byte and then re-parses it — the re-parse is the
anti-vacuity guard that stops a `{}` seed from passing the byte comparison. `guard-bash-integration`'s
re-pointed cases assert `guardStateWritten(root) === false`, an exact event list with the `file`
field, and an exact single `guard_advisory` on the broken-config Bash path; all three discriminate.
The precondition case is weak but not vacuous — `runGuard` throws on a non-zero exit, on a
fail-open marker and on unparseable stdout, so "the hook ran" is genuinely checked.

### Theme 4 — a record and a plan amendment state a count that has moved (1 finding)

**E. Medium — `CLAUDE.md`'s dangling-citation set grew from two to four at 7b, and the row that
carries the two new ones is now false in its entirety.**
`260816-2317_*_claude-mds-dangling-citation-set-grew-from-two-to-four-at-7b-and-one-whole-layout-row-is-now-false.md`

Measured by running the gate: `CLAUDE.md:29`, `:30` (twice), `:129`. The two new ones are on the
`fusion-guard.json` Layout row, whose subject no longer exists and whose prose is false in four
further places no lint can see — "the per-project guard configuration", the three-layer merge, and
both of the `guard.enabled` / `guard.protectedPaths` accounts. `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md` and step 16's Scope
paragraph both say "two". Step 16's *bound* is fine — the amendment says the two citations are the
reason for the step, not its limit — so what this changes is what the curator's survey has to find
on its own. `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md` has been given an `Also seen:` line pointing at the new record.

### Theme 5 — coverage (1 finding)

**F. Low — the write trace is now the guard's only product, and two of its four tools reach no
integration case.**
`260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md`

`extractFilePath`'s `notebook_path` branch has no case, and `MultiEdit`/`NotebookEdit` never reach
the hook in any test — `runWrite` defaults to `Edit` and is called with an explicit tool name once,
also `"Edit"`. The same grep over `3c2e1c6` returns the same single file, so this is not a
regression of the Turn; what changed is its weight, since `hooks/guard.ts:8-10` now calls the row
"the only record of what the write surface did". One case per tool closes it.

## On the dispatch's question 6 — what the deleted tests used to hold

**116 red cases became 5 and 3 228 lines of test left the tree. I found nothing that was genuinely
covered before this Turn and is covered by nothing now**, apart from finding F's pre-existing gap,
which is not this Turn's doing. Checked one by one rather than asserted:

- **`escalation.test.ts`** — unit cases over `escalation.ts` alone. Module deleted at step 3.
- **`guard-escalation-shape.test.ts`** — the coercion of a shape-valid-but-wrong `escalation.json`.
  Its *generic* seam, `lib/guard-state-file.ts`, survives with two callers, and
  `guard-state-shape.test.ts` covers exactly that seam and was deliberately kept; its own header
  argues at length for the coupled probe it now uses precisely so that this coverage would not be
  lost. This was the case most likely to have gone silently and it did not.
- **`guard-halt-event.test.ts`**, **`clear-halt-concurrent-halt.test.ts`** — subjects are the halt
  event and `clear-halt.js` respectively, both deleted. The second's 427 lines are a shimmed-build
  harness for `clear-halt.js` specifically and carry nothing reusable for a surviving subject.
- **`config.test.ts`'s cut describes** — `guard.enabled`'s project refusal, the sensitivity
  vocabulary, `findRelevantDecisions`, the plugin layer and its missing-file diagnostic. Every
  subject retired. What survives is covered better than before: the leaf walk, the null handling,
  the cache keying, the drop-equals-absent equivalence and the explicit-null root all kept their
  cases, and six new ones cover the retired file.
- **`paths.test.ts`'s 14 cut cases** — the four deleted matchers. `foldCase` kept its group and its
  live caller in `tracker.ts`.
- **`guard-bash-integration.test.ts`'s five cut cases** — the stand-down pair, two CHECK 3 denies
  and the `macOS realpath trap`. The trap itself is still pinned by the surviving precondition case
  (`:75-85`), which asserts both that the root is its own realpath and that the alias is a real
  second name for it.
- **`helpers/guard-harness.ts`** — `GOVERNED_*`, `governedFiles`, `withGovernedProject` went with
  the deny they packaged. `withPluginProject` kept three consumers, exactly as Turn 1 predicted.

## On the dispatch's question 4 — the three kept harness exports

**The call is right, and the step's text is what needs correcting — but not by editing it.** The
`escalation` seed option is load-bearing: without it there is no halted project to assert about,
and both properties `legacy-halt-clearing.test.ts` exists for are unassertable.
`EscalationSnapshot` is needed as the seed option's type and as the return of `haltedOn`.
`readEscalation` is the weakest of the three — `JSON.parse(readFileSync(...))` inline would do —
but its three lines at `legacy-halt-clearing.test.ts:165-170` are the anti-vacuity guard on the
byte comparison above them: without them, a seed that wrote `{}` would satisfy
`readFileSync(path) === before` and the case would pass while witnessing nothing. Keeping it is
right.

What the step's Changes text says ("the seeded `escalation.json` and `readEscalation`/`EscalationSnapshot`
go") is wrong, and the departure is recorded directly beneath it in the execution note. That is the
convention this plan has used consistently — steps 3/6 and step 5 do the same — so **the correction
belongs where it is and the Changes text should not be rewritten**. Finding A is the case where
that convention failed, not this one: there the departure was not recorded at all.

## Cross-cutting observations

**1. The plan is now read through two layers, and one of them is optional.** Every landed step
carries an execution note that corrects its Changes text, and the corrections are load-bearing:
step 5's dependency points the wrong way, step 9's file list is wrong in three places, step 6 was
executed with step 3. A reader who takes a step's Changes text as the instruction — which is what
it is for — gets a wrong instruction and has to notice the paragraph underneath. That is tolerable
for a landed step, where the note describes what happened. It is not tolerable for an **unlanded**
one, and finding B is exactly that case: step 13 has no execution note yet, so its wrong list is
the only text there is.

**2. Every finding this Turn is again about a sentence, and one of them is in a test.** Turn 1
observed that the plan's instruments made the code verifiable and left the prose unguarded. Turn 2
extends it in an uncomfortable direction: finding D is a *test* whose stated subject its assertions
no longer reach, and no instrument can catch that either. The gate set can tell you a test is red;
it cannot tell you a green one stopped discriminating. Three of the four re-pointed surfaces were
re-armed with real discriminators — the two-marker count, `guardStateWritten`, the re-parse after
the byte comparison — which is why the fourth is worth naming rather than shrugging at: the
executor was clearly looking for exactly this and found three of four.

**3. The migration is a text, a channel and a reader, and only the first two were designed.**
Finding C is not a defect in anything this Turn built. The diagnostic is correct, it fires in every
case where a budget would be lost, and it is emitted on the surface with the most traffic. What was
never decided is which human surface it lands on, and the decision record that chose this channel
over Setup argues about *emission frequency* on both sides without once naming a reader. Both
answers are cheap; the gap is that neither was chosen.

## Recommended sequencing

1. **Before step 11 runs:** add `agents/orchestrator.md:132` to its list and settle finding C's
   one-sentence question while the file is open. Add `:122`'s merge account and `bin/monitor:188`
   (finding G) in the same pass — three sentences across two files it already opens.
2. **Before step 13 runs:** correct the list, and correct it in the step rather than in a note,
   because there is no execution note to correct yet. Two entries drop, `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` drops with a
   sentence saying why, and `260804-1632_*_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md` needs a decision about whether a deferred question
   whose subject is gone gets a marker move at all — that is a decision record, not an edit.
   Finding B.
3. **Any time before the release:** finding A, wherever the hook tests are next opened. It is two
   sentences and it protects the wiring that carries the whole v10 migration.
4. **Any time:** findings D and F, both in the hook test surface, both cheap, neither blocking.
5. **Step 16's survey:** finding E is information for the curator, not work for a coder. The count
   in `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md` and in the amendment is two; it is four.

Nothing in this review asks for a change to the code this Turn wrote. The configuration move is
correct, the migration works when followed, the compiled tree is clean, and the reduction of the
test surface lost no coverage of a surviving subject.

---

## Reconciliation annotation — 2026-08-17

Findings not rewritten. Their disposition at HEAD, each verified against the tree:

**Four of the seven defects are closed**, on evidence in their own footers: `260816-2315_*_hooks-wiring-test-was-in-step-9s-list-was-not-edited-and-justifies-bash-by-a-mechanism-removed-on-260812.md`,
`260816-2316_*_step-13s-retired-line-list-is-wrong-in-three-of-its-four-entries-and-its-marker-scope-misses-a-fifth-record.md`, `260816-2321_*_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md` (all landed with plan step 11) and `260816-2317_*_claude-mds-dangling-citation-set-grew-from-two-to-four-at-7b-and-one-whole-layout-row-is-now-false.md` (landed with the
curator pass, `5763550`).

**Three remain open and are the whole of this Circle's open code-surface residue.** Theme 2's
finding is `260816-2318_o_*` — `agents/orchestrator.md:132` is unchanged at HEAD and the migration
notice still reaches a consuming project's chat through no mandate; it is the one open record
against a surface that has now shipped in v10.0.0. Theme 3's is `260816-2319_o_*` — the
`answer`-site case still carries its four original assertions and the bound this review asked for
was never written into the comment. `260816-2320_o_*` is also unchanged: `MultiEdit`,
`NotebookEdit` and `notebook_path` still appear in exactly one test file, `hooks-wiring.test.ts`,
and only as matcher entries.

**Theme 5's coverage finding widened rather than closed.** Turn 3 received no review pass at all,
so `bin/fusion-review-coverage --since 3d41d4a` now reports `uncovered=9`, six of them touching
shipped files, and the tag `v10.0.0` points at one of the six. Recorded as
`260817-1417_*_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md`.

**The migration verification this pass performed against a scratch project was repeated
independently** at plan step 15, against a real consuming project (`krk`), and passed. It surfaced
one pre-existing defect in `bin/monitor`, filed as
`260817-1217_*_the-monitors-dismiss-keys-are-html-escaped-as-text-so-a-quote-in-a-warning-truncates-the-attribute.md`
and verified still open at `bin/monitor:527-531` and `:621`.
