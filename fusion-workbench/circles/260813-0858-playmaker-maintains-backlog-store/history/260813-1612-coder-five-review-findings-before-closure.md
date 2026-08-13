# Coder — five review findings closed before Circle closure

**Status:** Complete
**Agent:** coder
**Date:** 260813-1612
**Circle:** `circles/260813-0858-playmaker-maintains-backlog-store`
**Source:** `circles/260813-0858-playmaker-maintains-backlog-store/reviews/260813-1545-coderev-playmaker-maintains-backlog-store.md`, findings 1, 3, 2, 7, 8 and the prose suggestion against finding 10.

## What was asked

Close five of the review's ten findings before the Circle closes, plus weigh the review's
one-word suggestion against the prose deliverable. The other five findings stay open and
were not touched. No version bump (deferred to the documentation Circle), no commit.

## What changed

### 1 — HIGH: the relay could not record a partial selection (`skills/next/SKILL.md`, Step 5b)

The step offered "choose which" and defined no continuation for it, while the bolded
**Ask, once.** in the same paragraph forbade the follow-up question that option needs.

Two paragraphs were added after item 2, following the precedent Step 6 already sets for its
own **Andere wählen** option: one further `AskUserQuestion`, one option per proposed
operation in the report's order, `multiSelect`, and what comes back marked is the approved
set. The single-operation case is merged into perform-all exactly as Step 6 merges its
single-entry case; nothing marked is perform-none. The bold lead now reads
**"Ask, once — and a second time only to narrow."**, and a third paragraph states what
"once" bounds: two questions at most, the second strictly narrowing the first's answer, no
third, no re-putting a declined operation. It closes by naming why a subset is the ordinary
answer — the four fixed line forms are one operation to a line precisely so a person can
approve them one at a time.

Item 3 needed no change: it already dispatches only when at least one operation was approved
and already says to list the approved operations and drop the rest.

### 2 — MEDIUM: `**Proposal source:**` was carried and never compared (`agents/playmaker.md`, `skills/next/SKILL.md`)

Three paragraphs were added to `## Two mandates, by dispatch path` →
`### A confirmation carried by the dispatch prompt`, before the trigger-segment line. The
first is the check: open the portfolio the stamp names, compare its header's
`**Generated:**` value, and on any disagreement — including a missing file or a missing
header value — perform no operation, write no file at all, and return naming both stamps.
The paragraph states the window (the user answering a question) and what can land inside it
(a Phase 4 dispatch, a second `/fusion:next`).

The skill side gained two sentences. Step 3 now says the stamp is load-bearing, names what
the second run does with it, and forbids the skill from writing the portfolio itself between
the two dispatches — that write would make the relay refuse its own proposals. Step 4 gained
the stale-stamp branch: say it plainly, name the operations that did not happen, dispatch
nothing further, because re-putting them is a fresh `/fusion:next` rather than a retry.

### 3 — MEDIUM: the second dispatch re-appended Circle-record sections (`agents/playmaker.md`)

The opening paragraph of the same subsection lost the clause "regenerate `$PORTFOLIO` so it
records what was performed" — which was what made the second run re-enter the six-section
regeneration at `:58` and therefore re-run Steps 3, 4 and 5 — and now points forward to the
three paragraphs that spell the dispatch out instead.

Two of those three answer this finding. **"Write no Circle record on this dispatch, and rank
nothing"** names all three appended sections and says why: no idempotence guard, and the
first run of the same relay appended them minutes ago, leaving two identical blocks on the
record `/fusion:next` is about to activate. It also disambiguates the sentence the review
flagged — "propose nothing further" is about backlog proposals, this is about the appends,
both hold.

**"Regenerate `$PORTFOLIO` from the file you just verified"** decides the portfolio question:
carry the Active, Anticipated, Recently-closed, Archived and Warnings sections across
verbatim from the file the stamp check has just established is current, rewrite the backlog
section alone from the store as it now stands, and stamp the header fresh. This composes
with finding 2 rather than sitting beside it — the copy is only sound because the stamp was
verified first, and re-deriving those sections is exactly what would need Steps 3 to 5.

### 4 — LOW: the surviving sentence in the boundaries paragraph (`skills/next/SKILL.md:297`)

"playmaker reads everything and writes only Circle records and the portfolio" became an
enumeration of four: the three appended sections on Circle records, the portfolio, its own
history log, and the backlog store it maintains, with a pointer at
`agents/playmaker.md` `## Two mandates, by dispatch path`. The safety conclusion is
preserved and now rests on the true list — the active Turn loop writes none of the four.

### 5 — LOW: the new overclaim in `/fusion:direct` (`skills/direct/SKILL.md:77`)

"except the playmaker" became "except its two writers", and the sentence now names both and
the mechanism for each: the playmaker holds the write key and maintains the store; the
shaper holds only the read key and still writes into it, renaming a promoted entry to `_c_`
and appending one `Promoted:` line. Both are bound by the same filing-versus-maintenance
line, which is what the paragraph already claimed for one of them. This agrees with the
`_c_` row of the conventions marker table, which the same commit had added.

### The prose suggestion — taken

`rules/fusion-workbench-conventions.md` `## Backlog entries`, the bold lead of the first
bound, now reads:

> **No agent files a backlog entry.** Filing is originating an idea; maintenance is
> reshaping ideas the store already holds.

One word: "originates" → "files". The acceptance condition for that sentence was that it be
quotable alone, and it was not — a split originates entries while originating no idea, so
read literally the old lead contradicted `agents/playmaker.md:114`, and only the marker table
two paragraphs down rescued it. With "files", the very next sentence supplies the definition
and both the merge and the split case settle inside the quote.

**Residual, not fixed and deliberately not in scope:** `agents/playmaker.md` states the same
bound four times in the "originates" wording (`:3` frontmatter, `:10`, `:60`, `:112`). Of
those, `:112` ("you reshape the ideas it already holds, and you originate none") is exact,
because "none" ranges over ideas. The other three say "originate a backlog entry" and carry
the same literal-reading residual the conventions lead just shed. The review did not file it
and the mandate lint does not read those sentences; noted here so the next hand finds it.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 1019 tests across 49 files, 49 files passed.

One intermediate failure, expected and resolved: the emission golden. The conventions file
is emitted to all sixteen agents, so the one-word change moved it by **−5 bytes**
(51 925 → 51 920) and every role total by the same −5. The golden was regenerated with
`UPDATE_RULES_GOLDEN=1`, the diff inspected (32 lines, every one of them the same −5 on the
conventions file or on a role total, nothing else), and the suite re-run without the flag.
`RULE_BASELINE` was not moved.

## Byte deltas

| File | Before | After | Delta |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md` | 51 925 | 51 920 | **−5** (always-on, all sixteen agents) |
| `agents/playmaker.md` | 36 949 | 39 155 | +2 206 (prompt, not rule-emitted) |
| `skills/next/SKILL.md` | 27 709 | 30 144 | +2 435 (skill body, loaded on invocation) |
| `skills/direct/SKILL.md` | 8 908 | 9 254 | +346 (skill body, loaded on invocation) |

The always-on floor **fell**. The Circle's 2 663-byte growth in always-on rule text is
unchanged by this work except for the −5; everything added landed in a prompt and two skill
bodies, none of which the emission budget measures.

## Hazard checks

`bin/fusion-paths next` emits `WORKBENCH`, `CIRCLE`, `SCAN_DECISIONS`, `SCAN_CIRCLES`,
`PORTFOLIO`, `TASKLIST`. `bin/fusion-paths direct` emits `WORKBENCH`, `CIRCLE`, `OUT_CIRCLE`.
Neither emits a backlog key, and `grep` over both skill bodies finds neither token. The
relay's added paragraphs carry entry paths as `<entry path>` placeholders and text, exactly
as the pre-existing ones do.

`playmaker-backlog-mandate-lint.test.ts` is green. Case 2 extracts the mandate clauses from
the section's prose bullets and excludes `### ` subsections by design, so the three added
paragraphs — all inside `### A confirmation carried by the dispatch prompt` — are outside
its corpus by construction rather than by luck. Case 3's retired-prohibition patterns match
nothing in the added text.

## Issue records — none renamed

The dispatch fixed the scope at four files and said "nothing else", so **no issue record was
renamed or annotated**, including the five whose findings this work closes:
`260813-1545_*_the-choose-which-branch-…`, `…_the-proposal-source-stamp-is-carried-…`,
`…_the-relays-second-dispatch-re-appends-…`, `…_the-next-skills-boundaries-paragraph-…`,
`…_the-corrected-sentence-in-fusion-direct-…`, plus `…_the-backlog-bounds-bold-lead-…` for the
prose suggestion. All six still carry `_o_`. Closing them is the orchestrator's or the
reconciler's act at Circle closure, against this log and the commit it produces.

## Not done, by instruction

Findings 4, 5, 6 and 9 stay open, as do their records. Finding 10's record stays open too:
this work took the review's suggestion against the prose deliverable, and whether that closes
the record is the reconciler's call, not mine. Six records were left untouched in all — those
five plus the reconciler's `260813-1545_o_the-deferred-version-bump-has-no-carrier-…`. No version bump. No commit. Nothing under `bin/` and no plan file touched.
