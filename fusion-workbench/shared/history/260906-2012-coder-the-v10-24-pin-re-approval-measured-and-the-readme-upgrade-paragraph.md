# The v10.24 pin re-approval, measured, and the README upgrade paragraph

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Two things standing between the tree and the v10.24.0 tag. Re-approve the reference-resolution
pin, measuring the per-file contribution myself by single-file revert rather than taking two prior
attributions on trust. And add the missing upgrade paragraph to `README.md` `## Install` for
`docs/upgrading-to-v10-24.md`. Scope: those two files, nothing else. No whole-tree git command, no
staging, no commit.

## What was done

### The README paragraph, written first because it moves the number

The paragraph was added ahead of the measurement on purpose: it cites the new note, the hand-run
checker and the monitor, so writing it after taking the counts would have invalidated them.

It sits at the head of the upgrade list, above the v10.23 paragraph, in the shape the nine existing
ones use: a bold `**Upgrading from v10.23?**` lead, the release's substance, and the closing
`` `docs/upgrading-to-v10-24.md` is the note.`` Its substance is the write-time citation-form
report, the checker's new `unrewritable-violations=` figure and per-row column with the statement
that no existing key, verdict or exit code moves, the monitor's port 0 and URL file, the
per-session commit-message path, and the one defect that ships open.

`bin/fusion-prose-metric` reads `README.md` at 34 em-dashes over 2 724 prose words, and the file at
HEAD reads 34 over 2 549: the paragraph adds none and lowers the rate. The `over` verdict is
pre-existing and out of scope.

### The measurement

Method throughout: back the file up to the scratchpad, write `git show HEAD:<path>` over it (or
delete it, for the untracked note), run the gate, restore from the backup, `cmp` the restore. No
whole-tree git command was used and no restore mismatched. The pin was held at a sentinel
`{-1,-1,-1}` for the duration so every run printed all three received counts, and the real values
were written at the end.

Full tree, with the paragraph in place: **1646 / 227 / 14**, dangling test green.

| reverted alone | paths | anchors | stampBare |
|---|---|---|---|
| nothing (full tree) | 1646 | 227 | 14 |
| `README.md` | 1643 | 227 | 14 |
| `docs/upgrading-to-v10-24.md` (removed) | 1633 | 225 | 14 |
| `install.sh` | 1646 | 227 | 14 |
| `.claude-plugin/plugin.json` | 1646 | 227 | 14 |
| `hooks/lib/citation-form.ts` | 1646 | 227 | 14 |
| `hooks/lib/citation-scan.ts` | 1646 | 227 | 14 |
| `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 1646 | 227 | 14 |
| all four release files together | 1631 | 225 | 14 |
| `README.md` + the note together | 1631 | 225 | 14 |

So the whole move is the two documents. The single-file shares sum to 16 against a move of 15; the
one shared token is the paragraph's pointer at the note, which resolves only while the note exists
and un-resolves under either revert. That overlap was measured, not reasoned: the pair reverted
together reads 1631/225/14 exactly, which is also what says no share is owed to a file outside the
release.

The note's own share is 12 and the paragraph's 3. Two independent confirmations. Before the
paragraph was written the tree stood at 1643/227 and removing the note alone returned it to
1631/225, which is the note's 12 taken with no pointer in the way. And both enumerate: the note
names the hand-run checker three times, the monitor and the hand-run sweep twice each, the
conventions file, the git helper module, the hooks README and the two upgrade notes one rung below
it, which is 12, with its two anchors the hooks README's file-list heading and the conventions
file's filename-pattern heading; the paragraph names the checker, the monitor and the note itself.

### Agreement with the two prior attributions

Both hold, and the walk sharpens them rather than contradicting them.

The release-mechanics log measured the note alone at twelve paths and two anchors. That is exactly
what this walk reproduces against the pre-paragraph tree. The write-time-detection log measured its
own four files at zero and named the other four as the movers without splitting them. That zero
reproduces file by file here. What the walk adds is the split it did not make: `install.sh` and
`.claude-plugin/plugin.json` each contribute nothing, the first because its one changed line is a
version string carrying no path token, the second because `surface()` never reaches it. There is no
third attribution to report, because none disagreed.

### The entry

Written at the head of the chain, extending the `BASELINE` line in place with `Previous:` in front
of the entry it displaces, so no physical line was added: the file is 1 005 lines at HEAD and 1 005
lines now, and the hook-test surface bound measures that file by the line.

### One claim in the chain that does not hold

The entry this one displaces says its plugin paths were named in prose "because this comment is
inside the corpus the gate counts and spelling them would move the number this entry exists to
explain". That is false for this gate, and it was measured rather than argued: a comment line
carrying three plugin paths, one heading anchor and one record citation was appended to this test
file and the gate still read 1646/227/14. `surface()` skips directories under `hooks/lib`, so
`hooks/lib/__tests__/` is not scanned at all. It is false for the workbench citation gate too, by
reading rather than by measurement: `fusion.json` `citations.extraPaths` declares `bin/*`,
`hooks/*.ts` and `hooks/lib/*.ts` and its own note says `hooks/lib/__tests__/*.ts` is deliberately
excluded.

The prose habit was kept anyway, and the new entry says both halves: no record is spelled in it,
and the stated reason is recorded as not holding. Two entries below it in the same chain already
state the true reason for the neighbouring cases, that `hooks/lib/__tests__/` is outside
`surface()`.

## What was not done, and why

`skills/help/SKILL.md`'s update topic names v10.20, v10.14 and v10.7. It was not advanced for
v10.23 and is not advanced for v10.24 here: it is outside the dispatched scope. Reported to the
dispatcher instead.

`README.md` `## Install` now carries ten upgrade paragraphs reaching back to v8, while `docs/` holds
thirteen upgrade notes; `docs/upgrading-to-v10-5.md` and `docs/upgrading-to-v10-6.md` have no
paragraph at all and `docs/upgrading-to-v10-8.md` is named only inside another paragraph, so "one
paragraph per shipped note" already does not describe the section. The three-release cap in
`CLAUDE.md` is stated about the help topic, not about this section, so nothing here violates a rule
as written. Whether the tail should be cut is a judgement above this task; reported, not acted on.

## Verification

`cd hooks && npm test` — exit 0. 52 test files, 911 tests, all passing, including
`reference-resolution-lint.test.ts` (38 tests) with the re-approved pin.
