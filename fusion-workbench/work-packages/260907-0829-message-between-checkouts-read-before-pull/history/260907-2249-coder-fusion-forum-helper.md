# Task S4: `bin/fusion-forum`, the helper that reads the message store out of a fetched ref

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Step 4 of `260907-1942_*_message-between-checkouts-read-before-pull.md`: write `bin/fusion-forum`, a
pure-bash helper on the shape of `bin/fusion-cadence-anchor`, with three subcommands (`new`, `show`,
`seen`) and six exit codes, its own header carrying the authoritative documentation. One file only;
the `.gitignore` exception, the `CLAUDE.md` row and the anchor header row are task S5.

## What was done

`bin/fusion-forum` written and made executable. It resolves the workbench through the sibling
`bin/fusion-workbench-root`, requires a git work tree, resolves the branch and its upstream with the
two commands `skills/setup/SKILL.md` `## Step 0k` uses, fetches with `GIT_TERMINAL_PROMPT=0` and
`GIT_SSH_COMMAND='ssh -oBatchMode=yes'`, derives the store's git-root-relative path, reads the mark
through `bin/fusion-cadence-anchor get last_forum_read_commit`, and takes `comm -13` over two sorted
`git ls-tree -r --name-only --full-tree` listings. Entries whose filename carries this checkout's own
identifier are dropped, and the degradation is a `note=` line when it cannot be.

Three things decided while writing, each recorded in the header rather than here:

- The store path is an argument and is validated as workbench-relative (no leading `/`, no `..`
  segment), so no second store-definition site is created and `path-literal-lint`'s `DEFINITION_SITES`
  needs no entry.
- Both sides of the path derivation are physicalised (`pwd -P`, and the toplevel resolved the same
  way). Without that, a `mktemp -d` tree on macOS — `/var/...` against git's `/private/var/...` —
  reports `workbench-outside-repo` for a workbench that is plainly inside the repository. Measured:
  the scratch verification below would have exited 7 throughout.
- The fetch is `git fetch <remote>` following the configured refspec, not a single-ref fetch. The
  remote-tracking ref must be updated before `ref=` is resolved, and a narrow fetch updates it only
  opportunistically; a stale tracking ref would not fail, it would report old news as current.

Two states beyond the plan's list, both inside exit 5 and exit 0 respectively and both documented in
the header's state vocabulary: `upstream-unresolved` (exit 5, an upstream is configured and its ref
does not resolve after the fetch) and a `note=` for a branch tracking a local ref, where no fetch is
owed. Neither adds an exit code.

`show` exits 1 when the blob cannot be read at that commit, with git's stderr passed through. 1 was
free in the table and the alternative was leaking git's own 128, which would have left the exit table
open rather than total. `seen` exits with the mark store's own code.

## What was verified

Every command was run and its exit code read. Details in the report; the summary is that all six
exit codes plus `show`'s 1 were produced at least once, `new=0` printed as a real answer against this
repository's own `origin`, and the delta showed exactly the entry a second scratch checkout pushed
while the mark stood on the pre-fetch upstream. `npm test` was not run, per the dispatch.

No file but `bin/fusion-forum` was touched. `git status --porcelain` on the project shows the three
sibling agents' edits and nothing of mine; `bin/fusion-forum` is still ignored by `.gitignore`'s
`bin/*` line, which is task S5's to except.
