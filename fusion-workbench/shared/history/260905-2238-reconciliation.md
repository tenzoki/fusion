# Reconciliation — loop 1's closures, verified against the tree

**Date:** 2026-09-05 22:38
**Agent:** reconciler
**Status:** Complete
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Domain:** code
**HEAD at dispatch:** `cd623b6f`
**HEAD at completion:** `4db7dddb`
**Session:** `260905-2008-orchestrator-session.md`

## What this pass was and what it was not

A scoped pass, dispatched to answer one question: does each of loop 1's closure notes say something
the tree bears out? The full workbench walk ran at `260905-2037-reconciliation.md` and the open corpus
was re-derived at `e9bd3e53` by
`260905-2158-the-nine-open-defects-after-loop-1-and-what-loop-2-should-do.md`. Both were read first
and neither is repeated here.

Fifteen records were opened: the eleven closed by repair in `12dee877` and `ea819262`, and the four
loop 1 closed on the stronger ground that the defect was already repaired. Each closure note was read
as a claim, and each claim was taken to the code, to a probe, or to a controlled measurement against
the pre-repair build. Nothing was accepted on the note's own word.

## HEAD moved under this pass

The dispatch named `cd623b6f`. At 22:22, mid-pass, a concurrent session committed `4db7dddb` against
the same checkout, and every present-tense reading below was re-taken there. Two orchestrator
processes are running against this project; `bin/fusion-session-mark` is advisory and does not
serialise them, which `CLAUDE.md` states and which
`260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md`
already records from the other side. It is recorded here because a reconciliation whose ground truth
moves is worth flagging even when the movement was a repair.

## A release gate was red at the dispatch HEAD

At `cd623b6f`, `hooks/lib/__tests__/citation-sweep.test.ts` failed. The record loop 1 filed in its own
closing commit named a `260905-2054` reconciliation history file and spelled it with its store
segment and a workbench prefix in front of that, which is a store-prefixed citation the sweep would
rewrite, so `--dry-run` read `files=1 rewrites=1` against the gate's `rewrites=0`. No history file
carries that stamp under the name it gave either; the reconciliation it means is `260905-2037`.

Loop 1's own log states that it re-ran the sweep and the gate after every append it made, and that was
true of `27b21b5d`. The regression entered two commits later, at `cd623b6f`, where nothing re-ran
them. The concurrent session repaired it at `4db7dddb` and the gate is green. Recorded, not filed: the
instance is gone and the rule it broke already exists.

## The eleven closed by repair

| record | claim | verdict |
|---|---|---|
| `260901-0320` | the stop is derived, not hand-written | holds; one prose residue, below |
| `260901-0321` | detection repaired, the census may rise | holds; the rise is now measured at zero here |
| `260901-0319` | the two drops separated, a note names how many of how many | holds |
| `260901-0322` | residual rows in file order, same multiset | holds, and measured sharper |
| `260901-0323` | the diagnostic names the element and the index | holds, including the byte-identical `maxTurns` clause |
| `260901-0324` | one spelling whichever directory the sweep runs from | holds, and stronger than claimed |
| `260830-1845` | `.asset-provenance` classifies with its R3 sibling | holds |
| `260828-1041` | the join is stated in the always-on rule | holds |
| `260828-0853` | the class L loop reports the unignored entry | acceptance holds; the branch has a false positive |
| `260904-1058` | the project-wide branch of the acceptance | holds, genuinely, not a weaker claim |
| `260904-2215` | three breaks closed, eight entries recovered | holds, re-walked independently |

### `260901-0321`: the census did not move

The note hedges, "may raise the reported figure". The measurement is cheap and was taken. The
pre-repair build from `12dee877^` was run against the current tree beside the current build, same
2534 files: `tokens=23373 resolved=18018 dangling=301 store-prefixed=396` from both, byte-identical.
The two builds differ (`md5` of `hooks/dist/lib/citation-scan.js` differs), so the experiment is real.

The repair added no token because the shape has no instance in this corpus. Three occurrences of
`_x_circle.md.` exist and none is a citation: a `$REC.tmp` sentence in an archived record, a
`260825-2023/_b_circle.md.` with no `circles/` segment, and this record's own `<circles>` placeholder.
A rise, if it comes, comes from a consuming project. The note is not falsified, and it was written
without the measurement that settles it.

The `.mdx` guard was checked by hand as well as by its pinned case. On `_t_circle.mdx` the optional
group takes `.md`, `NAME_END` refuses the following `x`, the group backtracks to empty, and
`(?!\.md)` then refuses the backtrack. No match, which is what the note says.

### `260901-0324`: verified by running it both ways, and the claim understates

The note offers one row as its evidence. Both runs were captured in full. `--dry-run` from the project
root and from `hooks/` are **byte-identical**, all 2940 lines, not merely agreeing on the first
residual row.

A first attempt at this appeared to refute the claim and did not: the filter used to read the root run
matched the word "residual" inside an archived record's filename. The program was right and the probe
was wrong.

### `260901-0322`: measured against the pre-repair build

Old build over the current tree: 556 files whose residual rows sit in non-contiguous blocks. New
build: 0, with 0 line inversions inside any file. The note says 557, measured on 2026-09-05 over a
corpus of 2907 residual rows against tonight's 2938, and dates its own measurement.

The row multisets differ by exactly one row, which is the sweep regression above and not a reordering
fault.

### `260901-0323`: exercised against a scratch project

Three malformed declarations were put to the loader through `citation-check`, and the three sentences
are distinct:

- `["a/*.go", ""]` gives "must be an array of non-empty strings, but the element at index 1 is an empty string"
- `["a/*.go", 7]` gives "…the element at index 1 is not a string"
- `"a/*.go"` gives "…got a string"

The pre-repair build on the first of those gives "must be an array of strings, got an array", which is
the defect as filed. The `maxTurns` message is byte-identical across the two builds, as the note
claims.

### `260828-0853`: the acceptance holds and the branch has a false positive

The shell branch was run verbatim over five scratch roots. All five behave as the note describes. The
counterfactual confirms the existence test is load-bearing and is larger than the note states: without
`[ -e ]` a fresh workbench reports **all nine** roster entries, not "its own lock and marker
directories", and four of the nine are files rather than directories.

What the fifth root did not cover is the ignore form this project mandates for the two directory
entries. `CLAUDE.md` requires `dir/*` for a shipped path inside an excluded directory, and
`.gitignore:95-96` applies it to `.guard-state` and `.commit-lock`. That form covers the contents and
not the directory path, so `git check-ignore -q` exits 1 on the directory and the branch reports a
departure. Run verbatim in this repository the loop prints one such line for `.guard-state` today;
`.commit-lock` prints too whenever a commit is in flight. Neither statement the report rests on is
true in that state: `git status --untracked-files=all` is silent, and `git add` of the directory or of
`fusion-workbench` stages nothing. Reproduced in a scratch root holding one ignore line.

The record's own acceptance names `.cadence-anchors`, a file, and that case is repaired, so the marker
stays `_c_` and the regression is filed separately.

### `260904-1058`: the project-wide branch is genuinely met

The acceptance asks the skill to state which of the two readings it is, and on the project-wide
reading asks either that the filename stop naming a person or that the report open by saying it covers
everyone. All three are on disk. `skills/cadence/SKILL.md` carries a **Scope** paragraph stating it is
a project digest saved per checkout and instructing that the gathering step not be filtered by author;
the report template opens `# Cadence — project digest` with a `**Covers:**` line and a `**Digested
by:**` line that says the checkout is not the author; the filename is `cadence-$CO.md`, keyed to a
checkout by `e1e72f77` before this repair. Step 7b is labelled as the one section that is not
project-wide, which answers the mixed-scope finding loop 1 appended rather than the acceptance itself.
The record was not closed against a weaker claim.

### `260904-2215`: the chain re-walked

Every `paths A -> B` entry on the chain line was extracted in order. All 34 adjacencies are exact,
from `1517 -> 1520` down to `1336 -> 1350`, which meets the `1325 -> 1336` on the line above. The
pre-repair file walked the same way still shows the three breaks the previous pass named and nothing
else in that range.

Nine `recovered 2026-09-05` marks stand beside entries. One is the transition figures restored to the
six-times summary entry at `9c056b6c`, leaving the eight the note claims, each naming its commit.

Outside the record's scope: seven further adjacency breaks stand in the 1544-1603 region, on the
one-per-line entries above the chain line. All seven predate this repair. They are not necessarily
faults, because the chain's own preface states the entries are not in chronological order, so a
file-order adjacency walk is not the invariant there. Recorded on the record, not filed.

## The four loop 1 closed as already-repaired

Each was re-verified independently rather than through loop 1's citation.

- `260831-2119`. `node hooks/dist/citation-check.js | grep -c "md\.'"` returns 0 against the 11 the
  record states. The tail now carries the derived stop.
- `260831-2120`. `circleDirs()` was called directly: four archive sweeps are indexed, and the bare
  name `260827-1535-safe-cleanup-tier-1` scans to one `stamp-name` token, `resolved`, matching
  `archive/260827-1535-safe-cleanup-tier-1`.
- `260901-0318`. `FABRICATED_NAME` at `hooks/lib/citation-scan.ts:490` is the word test, not the
  substring test. `store-prefixed=395` and the checker's verdict is `clean`.
- `260904-1839`. `portfolio.md` produces no violation row, and the closure is **not** vacuous: the file
  carries 15 citation tokens, every one `resolved`, and every Circle is cited by bare directory name
  with no `circles/` segment.

## The one prose residue

`260901-0320`'s repair deleted `SENTENCE_STOP` and left two present-tense references to it in the same
file, at `hooks/lib/citation-scan.ts:336` and `:384`. `grep -rn SENTENCE_STOP hooks/ --include='*.ts'`
outside `dist/` returns only those two comment lines. `reference-resolution-lint` reads paths and
heading anchors, not identifiers, so no gate sees it. Appended to the record rather than filed.

## Instrument readings at `4db7dddb`, after this pass's writes

- `node hooks/dist/citation-check.js`: `files=2535 dangling=301 store-prefixed=395 verdict=clean`
- `node hooks/dist/citation-sweep.js --dry-run`: `files=0 rewrites=0 residual=2944`
- `npx vitest run lib/__tests__/workbench-citation-lint.test.ts`: 13 tests, green
- `npx vitest run lib/__tests__/citation-sweep.test.ts`: 16 tests, green

The gates were re-run after every append below, so this pass introduced nothing the grammar reports
and nothing the sweep would rewrite.

## Every write this pass made

**Marker moves: none.** All fifteen records were already at their correct marker and none needed
moving. No decision marker was touched.

**One new defect filed**, `$OUT_ISSUE`:
`260905-2234_*_step-0js-new-unignored-branch-fires-on-a-directory-whose-contents-are-ignored-by-the-dir-star-form.md`.

**Reconciliation evidence appended to four closed records**, each below the existing `Resolved:` note
and each leaving that note unedited: `260901-0320`, `260901-0321`, `260828-0853`, `260904-2215`.

**A second `## Coherence` section appended** to `260905-2008-orchestrator-session.md`, below loop 1's
and replacing nothing.

No code, no data, and no record description was edited.
