# Reconciliation — 260813-2258-reconciliation.md

**Agent:** reconciler
**Domain:** `code`
**Circle:** `260813-0910-documentation-matches-shipped-plugin`
**Range:** `267a65c..HEAD` (`c0e4219`), 15 commits
**Session reconciled:** `260813-1815-orchestrator-session.md`, five Turns

## Method

This Circle's binding constraint is that a documentation defect is confirmed by reading both sides,
never by a match count. The same constraint was applied to this pass. Every verdict below names what
was read or run. Where a number appears, it is a count of files I listed or lines I opened, and the
listing is named beside it. Nothing here rests on a commit message, a closure note, or a step's own
claim about itself.

## What was reviewed

| Store | Read | Updated |
|---|---|---|
| Plans (this Circle + `shared/`) | 1 in-Circle plan, 10 steps | 1 — status, step-10 marker, reconciliation log |
| Issues (this Circle) | 25 records | 9 annotated (the open set) |
| Decisions (this Circle) | 2 records | 2 annotated |
| Reviews (this Circle) | 5 records (4 coderev, 1 conceptrev) | 5 annotated |
| Decisions (`shared/`) | 7 open, 12 answered | 0 |
| History (this Circle) | 11 records | 0 (the `## Coherence` append goes to the orchestrator's file) |

## Findings

### 1. The plan's inline state was accurate for nine steps and silent about the tenth

Steps 1 to 9 each carry `[DONE]`, and each was verified in the working tree at HEAD rather than in
its commit. The per-step evidence table is in the plan's own `## Reconciliation Log` and is not
repeated here. Two cross-checks confirmed the set as a whole:

- The session's diffstat over shipped files is exactly the union of steps 1 to 9's declared file
  lists — `CLAUDE.md`, `README-agents.md`, `README.md`, `docs/philosophy.md`, `docs/working-model.md`,
  `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `skills/help/SKILL.md`. Nothing outside
  the plan was edited, and `.claude-plugin/plugin.json` is untouched, which is what step 6's note says
  it should be.
- `cd hooks && npx vitest run` — **49 files, 1022 tests passed**, run here rather than cited.

Step 10 carried no marker at all, which is the same glyph as a step nobody reached. It is now
`[DEFERRED]` with the deferral recorded: chosen against by the user at the Turn 4 gate in favour of
five open review findings. Not started — `git log 267a65c..HEAD -- docs/plane-setup.md` returns
nothing. The plan header moved from `**Status:** In progress` to `**Status:** Partially Complete`;
the filename marker stays `_p_`, because the `_c_` rename is tied to every step being `[DONE]`.

### 2. The residual issue the plan requires does not exist

The plan's risk table states, for exactly this outcome: *"If it is deferred, the residual must be
filed as an issue rather than left in the Circle's prose, because the Directive promises the
verification."* The Circle record's Directive promises that `docs/plane-setup.md` has its command
forms and configuration fields verified against `bin/fusion-plane`.

Searched both issue stores. The newest record in either is `260813-2214_*`, filed by the Turn 4
review, and the deferral happened after it. No record names `docs/plane-setup.md` or the deferral.
**The promise is therefore carried only by prose — the plan's step-10 note, the Circle record's
Turn-5 log line, and this file — which is the placement the risk row exists to forbid.** Filing it
was excluded from this pass's dispatch, so it remains unfiled and is named here instead.

### 3. Every closed record is genuinely closed

Sixteen of the 25 defect records carry `_c_`. Each closure was re-checked against the artifact at
HEAD, not against its own `Resolved:` note. All sixteen hold. The per-review breakdown is annotated
on the five review files; the closure-by-Turn shape is: Turn 1 filed 7 (5 closed), Turn 2 filed 5
(2 closed), Turn 3 filed 6 (3 closed), Turn 4 filed 6 (6 closed), plus one filed by `coder` during
step 6 and still open.

### 4. Every open record is open for a reason

Nine records carry `_o_`, and each was re-verified as still present at HEAD — the defect line was
opened, not grepped for a count. Each now carries a `Reconciled: 260813-2258-reconciliation.md` line naming what was
read. Two of the nine sit outside this Circle's plan scope by construction (`README-hooks.md`, and
`agents/orchestrator.md` as the fifth carrier of the planner/domain claim); the rest are one-clause
edits in files this Circle already edited.

### 5. The step-6 completion note contradicts its own evidence

Confirmed independently rather than accepted from the reviewer: comparing each `| `<agent>` |` row
of `README-agents.md` at `22f892e` against `8d87192`, **fifteen rows differ and `bugfixer` alone is
byte-identical**. The plan's step-6 note and `260813-2043-coder-…` both say "twelve
corrected, four left standing", naming `shaper`, `planner`, `bugfixer`, `editor` — three of those
four are in the changed set. Twelve and four are the *input* split (rows unread versus
survey-confirmed), reused as an output split.

Open issue `260813-2052_*_the-step-6-completion-note-says-twelve-rows-corrected-and-names-three-that-changed.md`
already holds this and is assigned to `coder`. The note is left as written; rewriting a step's
evidence is not a reconciliation act.

### 6. Both conceptrev recommendations are unapplied, and one now matters more

`260813-1831-conceptrev-…` asked for an `S3 -.-> S4` edge in the plan's second diagram, and
for a correction to the risk row justifying step 10 as the deferral candidate. Neither landed. The
risk row still reads "the only step with no dependency in either direction"; counted from the plan's
own `Dependencies:` lines, **steps 1, 5, 8, 9 and 10 each have no dependency and no dependent —
five steps share the property.** Since step 10 was in fact deferred, that sentence is now the written
justification for a decision that was taken. Its consequence is right (nothing depends on step 10, so
deferring it blocked nothing); its uniqueness claim is wrong. The review is advisory; no issue filed.

### 7. Two stale pointers into the plan, all naming its pre-rename filename

The plan was renamed `_o_` → `_p_` in Turn 1. Three records still cite the old path:

- `_t_circle.md` head field `**Active spec/plan:**` → `…/260813-1820_*_…`
- both decision records' `Cross-references:` fields

The Circle record's head fields are the orchestrator's to write (its own Scope names exactly three
parts of the record it may touch, the head fields among them), so the pointer is reported, not
fixed. The two decision records now carry a note naming the current path. The general shape is worth
naming: **a citation that includes a state marker goes stale on every transition of the thing it
cites**, and `260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`
is the open record adjacent to it.

### 8. Turn 5's commit is unreviewed, and it is the only substantive uncovered commit

`bin/fusion-review-coverage` over the range: 15 commits, 5 reviews, 6 uncovered, `verdict=uncovered`.
Of the six uncovered commits, five touch no shipped file at all (the activation commit and the four
review-artifact commits — checked with `git show --name-only` per commit). The sixth is `c0e4219`,
Turn 5, which edits two shipped files and closed six findings. The session history states this
plainly rather than hiding it. The helper also reports the conceptrev review as `UNUSABLE` for
coverage purposes, because it carries no `**Reviewed-range:**` line — correct, since it reviewed a
plan rather than a commit range.

## New issues filed

None. The one gap that warrants a record — the deferred `docs/plane-setup.md` verification — was
excluded from this pass's dispatch and is named in finding 2 for the orchestrator or the user to
file.

## Files updated

- `260813-1820_*_documentation-matches-shipped-plugin.md` — status, step-10 `[DEFERRED]`
  marker and deferral note, `## Reconciliation Log`
- 9 open issue records — `Reconciled:` evidence line each
- 2 decision records — reconciliation note each, markers unchanged (both still open and unanswered)
- 5 review records — reconciliation annotation each
- `260813-1815-orchestrator-session.md` — `## Coherence` section appended (this pass's only
  cross-agent write)
