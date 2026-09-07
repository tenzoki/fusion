# Task S5: the three sites a new `bin/` helper owes

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Step 5 of `260907-1942_*_message-between-checkouts-read-before-pull.md`: make `bin/fusion-forum`
committable and documented. Three files, no others: the `.gitignore` exception, the `CLAUDE.md`
Layout row, and the `last_forum_read_commit` row in `bin/fusion-cadence-anchor`'s key block. Its
dependency, step 4, was already in the work tree.

## What was done

**`.gitignore`.** `!bin/fusion-forum` appended to the exception list under `bin/*`, after
`!bin/fusion-citation-sweep`, in the same shape as the other twenty exceptions. Without it the file
is invisible to git and would have been silently dropped from the plugin distribution, which is
what that block's own capitalised warning is about.

**`CLAUDE.md`.** One Layout row for `bin/fusion-forum`, placed after the last `bin/` row and before
the `rules/fusion-workbench-conventions.md` row. It states what the helper is and names its three
subcommands, records that the store path is passed in so `bin/fusion-paths` stays the single
resolution point (and so the path-literal gate needs no `DEFINITION_SITES` entry), points at the
helper's own header as the authoritative documentation, and carries the three things the header
covers that a reader would otherwise get wrong: `new=0` is a real answer and never an error;
`note=` is one line kind with three distinct uses, not one condition; `show` fails with its own
exit 1 rather than leaking git's 128, which is what keeps the exit table total. It closes with the
standing `[ -x ]` guard note citing
`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`.

**`bin/fusion-cadence-anchor`.** A `last_forum_read_commit` row in `## The keys the pipeline uses
today`, in the shape of the `last_reconcile_commit` row above it. It says the mark names the commit
whose forum entries this checkout has already been shown, names its writer (`fusion-forum seen`,
which delegates here so the key name is spelled in one place) and its reader (`fusion-forum new`,
which computes its own delta rather than asking `changed-since`, because the mark stands on a
fetched commit and the question is about a remote ref), and states that an absent or unresolvable
mark reads the whole store as new, bounded by retention rather than by a special case. The
retention figure is the archive run's own threshold, fourteen days by default, per
`260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md`
option 1, and is written as the run's threshold rather than as a per-store number, because no
per-store number is expressible.

## Verification

`git ls-files bin/` lists only tracked files and I did not stage anything, so it does not yet name
the untracked helper. The exception itself was verified with the two forms that can see an
unstaged file: `git ls-files --others --exclude-standard bin/` prints `bin/fusion-forum`, meaning
it is no longer ignored, and `git check-ignore -v bin/fusion-forum` reports the match as
`.gitignore:49:!bin/fusion-forum`. `git ls-files bin/` will name it from the commit that stages it.

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` exit 0, 20 tests
passed, which is the gate that asserts both directions between the files in `bin/` and the
`CLAUDE.md` Layout rows.

## One gate red, and not repaired here

`reference-resolution-lint.test.ts` fails against its committed `BASELINE` of
`{ paths: 1646, anchors: 227, stampBare: 14 }`; the tree reads `{ paths: 1663, anchors: 228,
stampBare: 14 }`. The baseline was not edited: re-approval is the user's, and the move is mostly
not this task's.

Shares measured by single-file revert against the working tree rather than attributed by reading
the diff:

- this task's `CLAUDE.md` row: **paths +4**, anchors 0 (1659 -> 1663). The four are the row's own
  `bin/fusion-forum` cell, `bin/fusion-cadence-anchor`, `bin/fusion-paths` and
  `hooks/lib/__tests__/path-literal-lint.test.ts`. The enumeration and the measurement agree.
- this task's `bin/fusion-cadence-anchor` row: **paths +1**, anchors 0 (1662 -> 1663). The one
  token is `bin/fusion-forum`, cited on a comment line, and a `bin/` file is scanned on its `#`
  lines.
- `.gitignore` is not a scanned surface and contributes nothing.

So this task's whole share is paths +5 and no anchor. The remaining +12 paths and the +1 anchor are
step 4's header and the sibling steps in flight at the same time, and are theirs to attribute.
