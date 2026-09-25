# Six citation tokens in the closure review, starred by hand

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

One bounded repair in `260908-1857-coderev-cut-skills-surface-add-post-body.md`, committed at `b625a47f`:
six record citations spelled a literal state marker where the storeless grammar requires the wildcard. No
finding, severity or word of the review was altered.

## Pointer or statement, decided per token

All six sit in the same construction, the finding heading `**<Severity> — <record>.**` at lines 21, 23, 29,
33, 35 and 39. The test in `rules/circle-records.md` `### Citation form in the portfolio` is what a star
would cost: a pointer loses nothing, a statement loses its content. In every one of the six the severity
word and the paragraph under it carry the whole claim, and the marker letter carries none of it: the
review nowhere asserts that a record is open. So all six are pointers and all six were starred.

Two independent confirmations that the letter was never the content. Two of the six had already gone stale
before this pass: `bin/fusion-citation-check` reported lines 21 and 23 as `stale-marker`, the records
having moved to `_c_` in the index, which is the death a spelled marker dies at its target's first
transition. And the file's own practice is already the wildcard everywhere else: the `**Not-opened:**`
head field, both relocated defects at line 45, and the open record discussed at length at line 51, where
the prose does say the record is open and still stars the pointer.

## Verification

`cd hooks && npm test` exits 1, on `1 failed | 924 passed`. The repair is complete and is not the failure.
`bin/fusion-citation-sweep --dry-run` reports `files=1 rewrites=2` and no longer names the review file at
all; it names one file, `260908-2033-coder-the-two-high-findings-of-the-closure-review.md`, an untracked
history log from the preceding dispatch whose `## Records closed` list spells `_c_` twice. That file is
outside this dispatch's touch list and was left alone. Before the repair the same command read
`files=2 rewrites=8`.

The sweep was never run in a writing mode. The tree carries pending changes, which is one of the three
conditions that mode refuses on, and forcing past it was not on the table.

## What this instance says about the open record

`260908-1800_*_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md`
does not cover it. Its acceptance test asks a Circle that defers its golden regeneration to tell a
stale-golden red from any other red before that final step. Here the golden is current, the preceding
dispatch did run the full suite, and it identified the second red correctly and said so in its own log.
The blind spot that record measures was not the one that operated.

What operated is one link further on: the file that reddens the gate is a record written *after* the last
verification, by an agent whose output is prose rather than code, and nothing runs between writing it and
committing it. That is the shape both times: the review at `b625a47f`, and the history log sitting
untracked right now with two more tokens of the same kind. Whether the record widens to cover it or a
second one is filed is not this dispatch's to decide; it was reported and nothing was written to it.
