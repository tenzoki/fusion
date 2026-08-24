# Coder — C3 step 4: `bin/fusion-identity`, the one identity mechanism

**Status:** Complete
**Task:** Plan step 4 of `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`
**Executor:** coder

## What was built

`bin/fusion-identity`, a bash helper with no node half and no compiled half, following
`bin/fusion-prose-metric` in shape: its own header is the authoritative documentation, carrying the
usage block, the exit-code table and the reasoning, and `CLAUDE.md`'s Layout row summarises rather
than restates it.

It prints at most two lines in the `KEY=value` shape `bin/fusion-paths` established:

```
PERSON=Kai Stalmann <ks@qantr.com>
CHECKOUT=5e8248d7
```

`PERSON` is git's own `Name <email>` form, read and never written. `CHECKOUT` is eight lowercase hex
read from `fusion-workbench/.checkout-id`, minted there from `/dev/urandom` on first read and never
again. Every reason goes to stderr, one line each. Nothing is substituted anywhere: a line the
program cannot produce is absent rather than empty.

## The exit-code table, and the departure from the step text

The step text folds two states into exit 1, "the identity cannot be produced". The blocking decision
`circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`
was answered after the plan was written, and option 2 makes those two states **opposite instructions
to the caller**: inside a git work tree with the identity unset the caller halts, outside a work tree
it carries on and files with the agent alone. A prompt keys on the code and cannot key on stderr
prose, so folding them makes the helper undecidable for its callers. The precedent is
`rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes, where 3 and 4 "must never
be merged" because they address different people.

| Code | Meaning | stdout | Caller |
|---|---|---|---|
| 0 | both lines produced | `PERSON=`, `CHECKOUT=` | proceeds |
| 1 | inside a git work tree, `user.name` and/or `user.email` unset or empty; names which | nothing | **halts**, reports the reason, files nothing, substitutes nothing |
| 2 | usage error: an argument was given, or `-h`/`--help` | nothing | fixes the call |
| 3 | the checkout identifier could not be resolved | `PERSON=` only | carries on |
| 4 | not a git work tree, so no identity is owed | `CHECKOUT=` only | carries on; person field **absent**, not empty |
| 5 | 3 and 4 together | nothing | carries on |

Three properties of that table, each argued in the helper's header rather than left to be inferred:

- **1 is the only code that means stop**, and the condition is evaluated in this one place. No agent
  prompt restates it (`rules/critical-stance.md` §2, and the decision's own constraints).
- **3, 4 and 5 are three codes rather than one "partial"** because the two halves are independent
  facts about the tree, so the outcome space is a 2×2 and the table tiles it. A caller learns which
  line is absent from a number instead of testing stdout for the absence of a line, which in shell
  is the reliable way to mistake an empty capture for a present one.
- **Exit 3 names an outcome, never a cause.** Three things reach it — no workbench above the working
  directory, a `.checkout-id` that does not hold an identifier, and a workbench the minting write
  could not reach. The caller does the same thing in all three and the cause is on stderr. Phrasing
  the code as "the identifier could not be resolved" rather than "this project has no workbench" is
  what keeps a broken install from being reported as an answer about the project, which is the
  distinction `bin/fusion-turn-budget` draws with two codes and this program draws inside one.
- **Exit 1 dominates.** When the identity is unset nothing is printed and nothing is minted: a
  failing call leaves no trace.

A `.checkout-id` holding anything but eight lowercase hex is reported and **never overwritten**. A
value already in use is not this program's to destroy.

## Minting, and the race

The write is a noclobber redirect (`set -C`), which is O_EXCL: it either creates the file
exclusively or fails. The value is read back from the file after the write on every path, so what is
printed is what the file holds rather than what this process generated, and the loser of a race
prints the winner's value. Measured: 20 concurrent invocations against a fresh scratch workbench
minted **one** identifier and all 20 printed it.

## The classification rode this commit, not step 6's

`fusion-workbench/.checkout-id` is a new root-anchored surface. `rules/workbench-tracking.md`
`## The four classes` binds one to a class "in the same commit that creates it, in the layout tree
and here", and `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` states the same
of a `bin/` helper that adds one. The plan assigned it to step 6; it was taken here instead, and the
reason is not tidiness. This commit is the one that makes the surface exist, and after it every
Setup and every filing agent creates the file. Untracked but not ignored, it would travel between
checkouts and hand two checkouts one identifier — the exact collision the field exists to prevent.
That is a live defect from the moment this commit lands, not a documentation gap, so all three
sites moved together:

- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`: a tree line beside
  `.active-circle`, `.fusion-setup` and `.asset-provenance` per the plan's placement, plus one
  paragraph saying what it holds and that it never travels.
- `rules/workbench-tracking.md`: `.checkout-id` added to the class L entry list, with its own clause
  in the "why each class L entry is in class L" paragraph. It is class L for the opposite reason to
  the rest — not because a past version answers nothing, but because it answers *which checkout*.
- `.gitignore`: `fusion-workbench/.checkout-id` under the class L list, and `!bin/fusion-identity`
  in the helper exception list.

**What step 6 inherits.** Three of its bullets are already done (layout-tree line, class L entry,
`.gitignore` class L line) and **537 bytes** of its 2 400-byte always-on allowance are spent: the
five always-on files measured 95 252 before and 95 789 after. Step 6's cap of 97 652 is unchanged,
leaving 1 863 of the allowance and 2 784 against the hard bound of 98 573.

## Verification

Every exit path exercised in scratch trees under `mktemp -d`, plus this repository:

| Case | Printed | Exit |
|---|---|---|
| this repository | `PERSON=…`, `CHECKOUT=5e8248d7` | 0 |
| second run, same tree | same two lines, same `CHECKOUT=` | 0 |
| argument given | usage on stderr | 2 |
| `--help` | usage on stderr | 2 |
| git tree, both values unset, workbench present | stderr "git user.name and user.email are not set"; nothing on stdout; **no `.checkout-id` minted** | 1 |
| git tree, only `user.email` unset | stderr "git user.email is not set" | 1 |
| git tree with identity, no workbench | `PERSON=…` only; stderr "no fusion workbench above …" | 3 |
| git tree with identity, `.checkout-id` = `NOT-HEX` | `PERSON=…` only; stderr names the file, says it was not overwritten; file verified unchanged | 3 |
| git tree with identity, `.checkout-id` empty | `PERSON=…` only; same message | 3 |
| not a git tree, workbench present | `CHECKOUT=1e271794` only; stderr "not a git work tree, so no identity is owed and none is missing" | 4 |
| not a git tree, no workbench | nothing on stdout; both stderr lines | 5 |
| 20 concurrent invocations, fresh workbench | one identifier, printed by all 20 | 0 |

`cd hooks && npm test` — **exit 0**, 41 files, 724 tests, all passing.

`git check-ignore -v bin/fusion-identity` reports `.gitignore:42:!bin/fusion-identity`, so the
helper is not ignored; `git ls-files -o --exclude-standard bin/` lists it as ready to be tracked.
`git ls-files bin/` cannot list it before the commit, which this task did not make.

## Gate-forced records

- `hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated (`UPDATE_RULES_GOLDEN=1`), the
  537-byte growth of `fusion-workbench-conventions.md` propagated to every role. Regeneration moves
  no baseline, so the hard bound still stands.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved,
  `{paths: 1291, anchors: 180, records: 117}` → `{paths: 1303, anchors: 181, records: 119}`. The
  move was checked against the edit rather than accepted: the baseline was confirmed green against
  HEAD content of the four edited files first, so the whole delta is this step's own citations, and
  `bin/` is in that gate's corpus, which is where most of the twelve paths came from.
- `hooks/lib/__tests__/surface-growth-bound.test.ts` untouched; no baseline in it was edited.

## Not done here

The helper has no caller yet. Steps 6 through 10 give it one; step 5 gives it a test file.
