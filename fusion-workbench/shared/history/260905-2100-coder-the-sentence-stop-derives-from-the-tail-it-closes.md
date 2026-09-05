# The sentence stop derives from the tail it closes, and a declared drop is named

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Three records from `260901-0325-coderev-the-citation-mechanism-v10-20-0-to-v10-21-1.md`, all in
`hooks/lib/citation-scan.ts`:

- `260901-0320_*_the-sentence-stop-lookbehind-does-not-cover-the-bracket-characters-the-record-tail-admits.md`
- `260901-0321_*_a-circle-record-citation-that-ends-a-sentence-produces-no-token-at-all.md`
- `260901-0319_*_a-declared-pattern-whose-index-entry-has-no-work-tree-file-reports-declared-files-zero-with-no-note.md`

Scope: that file and its own tests. No build, no commit, no whole-tree git command; three sibling
coders were editing `hooks/citation-sweep.ts`, `hooks/citation-check.ts`, `hooks/lib/config.ts` and
`hooks/lib/staging-drift.ts` in the same batch.

## What changed

### The two grammar records, one change

They are one defect read from two sides, and the review says so: a character set written for one
pattern and reused on two others. The repair states each set once.

`SENTENCE_STOP` is gone as a constant. `recordTail(chars)` returns the pair `{ cls, stop }` — the
greedy tail class and the lookbehind that closes it — from one spelling of the tail's characters,
appending the `.` and the trailing `-` itself. Two calls: `BARE_TAIL` for `A-Za-z0-9_…*` and
`REC_TAIL` for the same plus `\[\]`. `BARE_RE` is byte-equivalent to before. `REC_RE`'s stop now
carries the brackets its tail has admitted since `4cffcae4`, which is the `260901-0320` fix: a
store-prefixed token ending in `]` no longer keeps the sentence's stop, and the `fix` string no
longer tells the writer to put a full stop inside the basename.

`260901-0321` is the same boundary meeting a pattern with no greedy tail. `CIRCLE_REC_RE`'s tail is
a literal, so it cannot eat a stop and the lookbehind has nothing to do there; what refused the stop
was its trailing lookahead, whose class carried a `.` that `CIRCLE_RE`'s did not. The two Circle
patterns now share one constant, `NAME_END`, which is `CIRCLE_RE`'s spelling. So the record's
acceptance holds — a `circles/<dir>/_x_circle.md` ending a sentence is one whole `circle-record`
token instead of no token at all — and the two endings can no longer drift apart.

One guard went in with it, and it is the reason this is not a two-line edit. With `.` out of the
lookahead, the optional `(?:\.md)?` would give the `.md` back on `_x_circle.mdx`: the group
backtracks to empty, the lookahead is then satisfied by the `.` it no longer refuses, and the
pattern would report a `circles/<dir>/_x_circle` token where it reports none today — one a rewriter
would splice under a `.mdx` it never covered, which is the defect class the file's own header warns
about. `(?!\.md)` after the group refuses that backtrack. Probed: `.mdx` and `_x_circleX` are still
no token, `_x_circle` alone and `_x_circle.md` before a space are unchanged.

Filed as one change, not two. The one constant both records name is the same constant, the reviewer
sequenced them as one commit, and a repair that derived the class without giving the Circle pattern
the derived ending would leave the third copy of the character set standing.

### The declared-paths record

`declaredCitationFiles()` dropped an index entry with no work-tree file by a bare `continue`, in the
same condition as the dedup drop. The two are separated now: a missing path pushes to a new
`missing: { pattern, paths, named }[]`, a duplicate still drops silently, because they are different
facts. `declaredCitationNotes()` emits one line per entry naming how many of how many the work tree
does not hold and which ones, so both hand-run helpers print it without either being touched — they
already route every note through that function.

The docstring's case split goes from five branches to six, and says which quantity it is disjoint
over: branches 5 and 6 are not exclusive per pattern (a pattern can contribute files and a missing
entry), and the path is what lands in exactly one place. The header's pointer to the split moved
with it.

## Tests

Two rows added to `citation-grammar-boundaries.test.ts`, inside the existing sentence-stop describe
rather than as a new block: the bracket-marked store-prefixed token, which the eight probes there
cannot reach because every one of them is a `bare-record`, and the Circle record ending a sentence
with the `.mdx` non-token as its control.

`declared-citation-paths.test.ts` is new — three cases over a scratch git repo (`git init`, `git
add`, then `rm` without `git rm`): every file present says nothing, one file gone is read and named,
every file gone reports a note rather than a silent `0` while `unmatched` stays empty. The hook-test
budget is shared and nearly spent, so the two files add 88 lines between them (70 new, 18 added)
and no restated prose.

## Verification

`npx vitest run lib/__tests__/citation-grammar-boundaries.test.ts
lib/__tests__/declared-citation-paths.test.ts lib/__tests__/workbench-citation-lint.test.ts
lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/record-counts-measurement.test.ts
lib/__tests__/fenced-code-exemption.test.ts` — exit 0, 6 files, 120 tests.

`npx tsc --noEmit` — exit 0.

`citation-sweep.test.ts` has three cases failing in the working tree, and they are not this change:
each spawns the committed `hooks/dist/citation-sweep.js`, which no source edit reaches until a
build, and each carries a sibling's issue number in its own comment (`260901-0322` residual order,
`260901-0324` the corpus spelling). Its fourth case, the `rewrites=0` gate over this repository,
failed once inside a full-file run while siblings were writing the tree and passes on its own.
