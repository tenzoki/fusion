# Coder session — three review findings on the provenance lint gate

**Date:** 2026-08-02 13:32
**Agent:** coder
**Status:** Complete
**Circle:** `260801-1244-rule-provenance-header`
**Plan:** not a plan step. Turn 2 review remediation — three of the seven findings a code
review filed against Turn 1 (`929dbf5`..`cac3726`), the three that live in the gate's test
file. The prompt was the specification.
**HEAD at start:** `cac3726`
**Voice profiles:** `bin/fusion-rules coder` emitted no `chat-voice-*.yaml` or
`default-voice-*.yaml` path in this session; noted per `rules/agent-setup.md`, proceeded.

## Scope

One file, `hooks/lib/__tests__/provenance-header-lint.test.ts`, +140/−31. No other path
outside `fusion-workbench/` changed. No commit.

## Issue 1 (Medium) — the gate did not recurse

`260802-1250_*_provenance-gate-does-not-recurse-so-rules-shards-would-escape-it.md`.

Took fix option 1 (recurse), not option 2 (assert flatness), because the curator Circle's
shards may land nested and option 1 survives either shape.

`gatedFiles()` split into `gatedFilesUnder(dir, relTo)` plus a one-line wrapper. The helper
is `readdirSync(dir, { recursive: true, withFileTypes: true })`, keeps `isFile() &&
name.endsWith(".md")`, builds `abs` from `join(e.parentPath, e.name)` and `rel` from
`relative(relTo, abs)` normalised to forward slashes, and sorts by `rel` in code-unit order
so a caller can assert the whole set. `isFile()` also closes the latent `EISDIR` crash the
reviewer noted.

`rel` construction was the second half of the fix and is easy to miss: the old code built
`rules/${basename}`, so a shard at `rules/conventions/layout.md` would have been *found* by
a recursing traversal and then *reported* as `rules/layout.md` — a path the reader cannot
open. There is a test for that specifically.

### How the recursion is verified rather than asserted

The prompt asked what evidence distinguishes a recursing gate from a non-recursing one when
the real corpus is flat, and the honest answer is: nothing that reads the real corpus can.
`gatedFiles()` returns the same ten entries either way, so a count assertion, a
`toEqual([...ten files])`, and the corpus test itself are all invariant under the mutation.
The distinguishing evidence has to come from a tree that has a subdirectory, and the prompt
rules out (correctly) creating one under `rules/`.

So the new describe block builds a throwaway tree in the OS temp directory — `mkdtempSync`
in `beforeAll`, `rmSync` in `afterAll`, the convention three sibling test files already use
(`fusion-paths`, `context-manifest`, `fusion-plane`) — and drives it through the same
function the gate calls:

```
top.md, notes.txt, nested/deep.md, nested/notes.txt,
nested/deeper/deepest.md, looks-like-a-file.md/   (a directory)
```

Four tests: the exact file set at every depth (which also proves `.txt` is still filtered
at depth), the `.md`-named directory is skipped, a nested file is reported by its full
relative path, and — the property in the gate's own terms — the headerless nested files
appear in a `filter(no header)` pass, which is exactly what the corpus test does.

**Mutation-tested, both directions, actual output.** Removing `recursive: true`:
`3 failed | 24 passed` — the three depth-dependent tests fail, and the corpus test stays
green, which is the finding restated as a measurement. Removing the `isFile()` predicate:
`3 failed | 24 passed`, including the `.md`-directory test. Both mutations were reverted
from a scratchpad backup; final state re-verified green.

## Issue 2 (Low) — removed the corpus-prose test

`260802-1254_*_the-corpus-prose-test-asserts-a-fact-about-the-corpus-not-about-the-gate.md`.

Chose **removal** over the reviewer's suggested reduction, and went one step further by also
dropping the drift guard the reviewer wanted kept.

The drift guard only exists to police the fixture's label — "the real corpus prose from
rules/user-facing-output.md". Relabel the fixture so it no longer claims to be a live copy
and the guard has nothing left to guard, while the string itself keeps its full value: it is
an in-memory fixture, and long realistic prose mentioning provenance mid-sentence is a
legitimate negative case whether or not that exact sentence is still in the corpus today.
Keeping the guard would have kept a test that fails on an innocuous edit to
`user-facing-output.md` and reports "refresh the fixture" — a maintenance tax for zero gate
coverage. So: fixture kept, honestly relabelled ("long blockquoted prose mentioning
provenance mid-sentence"), corpus-reading test deleted, and a comment left in its place
recording what stood there and why it went.

**Coverage lost, and where it lives now.** Nothing about `headerLine` is lost.

- Anchor rejection (the only ground on which that line was ever rejected) — the
  "keyword mid-sentence" fixture, and the relabelled long fixture itself.
- Case, and the missing colon — the two dedicated one-line fixtures. These were never
  exercised by the long fixture: the match dies at the anchor before either is reached.
  The old comment claimed otherwise, which is finding (a).
- Position — the window block (a real header moved one line past the boundary) and the
  conventions-file block, whose decoy genuinely matches `HEADER` and is excluded by
  position alone, with its own non-vacuity guard.
- `user-facing-output.md` carrying a header at line 3 — the corpus test, which asserts it
  for all ten files.

## Issue 3 (Low) — the ten-line rationale, corrected

`260802-1253_*_the-line-8-blockquote-rationale-is-false-in-the-commit-that-states-it.md`.

**The true numbers, measured, for the sibling task that owns the conventions file:**

| | |
|---|---|
| Longest opening blockquote, before the headers landed | lines 3–8, `context-manifest.md` |
| The same blockquote today | **lines 5–10** |
| Header position in that file | line 3, above the lede |
| A header placed *after* that lede today would sit at | **line 12** — outside the window |

Measured with `grep -n '^ \{0,3\}>' rules/*.md` across all ten files and confirmed by
reading `rules/context-manifest.md:1-12`. The runner-up is `context-lean-claude-md.md` at
lines 5–9. So the window's end and the corpus's longest lede now coincide exactly, and the
"one line to spare" margin is gone — not because the window is wrong, but because every file
now puts its header *above* the lede, which is the placement the plan chose uniformly and
which needs no margin at all.

The comment at the `HEADER_WINDOW` constant now says this in the past tense for the sizing
decision and the present tense for the current bound, and names the fix for a file that
cannot fit (put the header above the lede). `rules/fusion-workbench-conventions.md` was not
touched — the sibling task owns it.

## Two other comments corrected, both in scope

- The file-set claim at the top of the header comment ("The file set is `rules/*.md` …
  automatically") now states the recursive set, cites the curator Circle as the dated
  reason, names the `isFile()` guard, and says outright that the flat corpus cannot itself
  demonstrate the traversal, pointing at the block that can.
- The `--- fixtures: in-memory strings, never files on disk ---` banner became "never files
  under `rules/`" plus a parenthesis naming the temp-tree block as the single exception.
  The old wording was true when written and would have been false after this change; the
  point of Issue 2 is that a comment must not claim more than the code does.

## Verification — actual output

1. `cd hooks && npx vitest run lib/__tests__/provenance-header-lint.test.ts` →
   `Test Files 1 passed (1)`, `Tests 27 passed (27)`, 14ms. Was 24 before; the four new
   traversal tests, less the one removed.
2. `cd hooks && npm test` (`tsc && vitest run`) →
   `Test Files 17 passed (17)`, `Tests 780 passed (780)`, 20.59s. `tsc` clean — it gates
   `vitest` in the same script, so vitest running at all proves it passed. Note for the
   record: `hooks/tsconfig.json` excludes `lib/__tests__`, so `tsc` does not type-check this
   file; vitest's esbuild transform strips types without checking. The types here are
   nonetheless exercised at run time (`e.parentPath` needs Node ≥ 20.12; this repo is on
   v24.2.0, `@types/node` ^25.6.0).
3. Recursion demonstrated on a real nested tree, and the trees removed — the two mutation
   runs above, plus `find rules -name '*.md' | wc -l` → `10`, `find rules -mindepth 1 -type
   d | wc -l` → `0`, and no `provenance-tree-*` directory left under the OS temp root.
4. `git status --porcelain` outside `fusion-workbench/` →
   `M hooks/lib/__tests__/provenance-header-lint.test.ts`, exactly one path.

## Not done

No commit — the user commits. The issue files were not edited; the user closes them.
`rules/fusion-workbench-conventions.md` untouched, as instructed. The other four review
findings are out of this task's scope.
