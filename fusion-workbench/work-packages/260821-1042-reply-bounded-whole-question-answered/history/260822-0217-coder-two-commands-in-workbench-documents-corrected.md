# Two commands in workbench documents corrected

**Agent:** coder
**Status:** Complete
**Date:** 2026-08-22T02:17+02:00
**HEAD at start:** `055585f`
**Circle:** 260821-1042-reply-bounded-whole-question-answered

## What was dispatched

Two defect records, both about commands written into workbench documents rather than
about code: the briefing's contamination test, and the measurement report's scratch
directory. Explicitly bound: no `hooks/`, `rules/`, `agents/`, `skills/` or `stilwerk/`,
no re-measurement, no figure change, no staging and no commit.

## What was done

**Defect 1**, `260822-0035_*_the-briefings-contamination-grep-marks-49-of-72-transcripts-primed-because-the-setup-skill-body-names-the-files-it-greps-for.md`.
A dated correction note was added to
`260822-0010-measurement-briefing-does-the-rule-change-shorten-a-reply.md`,
`## The contamination rule, stated once`, immediately under the paragraph that states the
broken test. Seven lines: the test does not work and must not be run as written, the
one-clause reason, the pointer to section 4 of the measurement report for the working
test, and one sentence saying the working command is deliberately not copied across so
that one command does not become two that drift. The rule the section states, that a
primed session may measure history but may not contribute replies, was left untouched.

**Defect 2**, `260822-0116_*_the-contamination-command-reads-a-scratch-directory-it-never-clears.md`.
The defect was still live at the report's current text: section 4's pipeline still built
into `$T/conv` with a bare `mkdir -p` and then globbed the whole directory. The record's
first option was taken verbatim, `rm -rf "$T/conv"; mkdir -p "$T/conv"`, with a two-line
shell comment above it saying why the directory is cleared rather than reused. Nothing
else moved: `$T` is still `${TMPDIR:-/tmp}` and section 6 step 2's `"$T/unprimed.list"`
path is unchanged. No figure was re-measured or edited.

## The consequence of the two closures, handled

Closing the first record renamed it `_o_` to `_c_`, which killed three pointers that spelled
its old marker as a letter: one in `260822-0035-analyst-three-before-figures-and-the-after-measurement.md`,
one in the filed-records list of `260822-0035-three-before-figures-and-the-after-measurement-defined.md`,
and one in the `Not-opened:` field of `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`.
All three were respelled in the star form `rules/fusion-workbench-conventions.md`
`## Marker globs` prescribes for a pointer. None of the three files is in the citation
gate's corpus, which holds Circle records, `portfolio.md`, open issues and live decisions,
so this was rot repair rather than a red run avoided. The review's line 12, which names
`260822-0035_o_*` as a statement about the pair of records rather than as a pointer, was
left alone.

## Prose measurement

`bin/fusion-prose-metric` over the two documents and the two closed records. The briefing
was already over its ceiling before this run at 2 em-dashes in 1128 words; the note added
none, so the rate fell from 1.8 to 1.6 per 1000. The report stands at 0.6 against a permit
of 5. The first closed record carries none. The second carried one, from the `Resolved:`
note as first drafted, and it was rewritten to a colon.

## Verification

`cd hooks && npm test`: exit 0, 40 files, 718 tests. Nothing staged, nothing committed.
