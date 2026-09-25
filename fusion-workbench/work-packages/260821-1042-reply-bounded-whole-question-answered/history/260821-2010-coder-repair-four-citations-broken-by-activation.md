# Coder: the four citations the activation rename broke

**Status:** Complete
**Agent:** coder
**Circle:** `260821-1042-reply-bounded-whole-question-answered`
**Dispatched by:** the orchestrator, with the four files named and the scope closed around them
**HEAD at time of work:** `e764637`

## What was done

Four decision records under this Circle's `decisions/` each carried, on line 6, a
`**Cross-references:**` field addressing this Circle's own record by its exact filename with the
anticipated marker spelled out. Activation renamed that record and the four pointers went dangling.
Each line 6 now cites the marker position as `_*_`, which is the form
`rules/fusion-workbench-conventions.md` `## Marker globs` requires and
`260806-0015_*_zitierform-fuer-workbench-records.md`
ratified. The dangling token is not reproduced here: the citation gate reads this file too.

## Pointer or statement, per file

`rules/circle-records.md` `### Citation form in the portfolio` splits a pointer from a statement
about a marker, and the split decides the repair. All four turned out to be **pointers**, so all
four take the wildcard. None is a statement about the anticipated state.

The evidence is the same in each case and was read in context rather than inferred from the field
name. The citation is the sole content of a `**Cross-references:**` header field, whose office is to
address the record this decision was filed against. No body prose in any of the four discusses the
Circle's state, and `grep -n "circle.md"` over the four returns exactly one line each, so there was
no second occurrence to classify differently. Applying the rule's own test: starring the marker
costs each of these four nothing, because none of them says anything the letter carried.

- `260821-1108_*_is-claude-mds-register-repair-inside-this-circle.md`: pointer.
- `260821-1108_*_may-an-agent-read-the-session-transcripts-as-a-source-of-evidence.md`: pointer.
- `260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`: pointer.
- `260821-1108_*_which-surfaces-may-this-circle-change.md`: pointer.

## Why the wildcard rather than the current letter

Retargeting to the marker the record carries today would have cleared the same four failures and
died again at this Circle's next transition, which is `_t_` to `_c_` or `_b_` and is ahead of it.
The wildcard survives every remaining transition, and a reader resolves it against the store and
reads the current marker off the resolved filename.

## Growth bounds

None of the four bounded surfaces was touched. The edits are to workbench records, which sit in no
budget. The hook suite gained no line and no skill body gained a byte, so the 21 lines and 30 bytes
of head-room standing at `e764637` are untouched.

## The defect record stays open

`260821-1810_*_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md`
was read before the repair and holds the analysis. It is a repair rather than a fix and the record
says so itself: the loop reproduces at the next anticipated Circle that has scoping decisions filed
against it, because the writers still reach for the exact filename. Closing the record was out of
scope and would have been wrong, since its cause stands. Nothing was appended to it either, because
it already states what was done here and what remains.

## Verification

`cd hooks && npm test`, exit 0. 40 test files passed, 718 tests. The citation lint reports no
violation. An earlier run of the same command printed an empty exit code because `PIPESTATUS` is a
bash array and this shell is zsh; the run was repeated with the code read directly rather than
reported from the tail of the output.

## Files written

- the four decision records named above, line 6 in each
- this history file

No shipped file was touched. Nothing was staged and nothing was committed. No agent was dispatched.
