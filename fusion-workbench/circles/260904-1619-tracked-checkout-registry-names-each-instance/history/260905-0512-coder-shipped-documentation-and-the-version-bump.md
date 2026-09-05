# coder — step 12, the shipped documentation gains one helper, one store and one upgrade note

**Status:** Complete
**Date:** 2026-09-05
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 12

## What was done

Five files, one of them new. The marketplace repository, the tag and the push
are deliberately not among them: this step prepares a release and does not make
one, because the plan's `## Where this Circle stops` puts the review-coverage
read in front of the tag and step 13 is what runs it.

**`CLAUDE.md`.** The `bin/fusion-checkout-name` Layout row that step 2 added was
already in the house form and already carried the two things a reader is meant
to take away from it, so it was read against the helper header and left
untouched rather than rewritten for the sake of a diff. It summarises the usage
block, the five-code exit table and the entry grammar without restating them; it
states that the alias is an attribute and the hex stays the key in the filename,
in every event line, in every claim field and in every comparison; and it states
that a resolution failure renders the hex rather than a substituted name,
because `resolve` on an unregistered hex exits 3 printing nothing. The one edit
to the file is in the `fusion-workbench/` row: `checkouts/` joins the four
shared-only stores the row already names, and one sentence says it holds one
entry per checkout, written by `bin/fusion-checkout-name` and by nothing else,
and that it is what lets an eight-hex identifier be rendered as a name.

**`README-hooks.md`.** The step made this file conditional on step 4 having
changed a `hooks/lib` module's stated contract, and it did. The
`lib/events-query.ts` row enumerates that module's arguments as an exhaustive
list, "the log text, the reading identity and the current time", and after step 4
there is a fourth. The purity claim itself is unchanged and stays as written;
the enumeration gained the identity map, and one sentence says what the map buys
and that an empty one is the identity function, so a project with no registry
runs the same code and gets the figures it got before. The entry-point row above
it gained one clause, because `hooks/events-query.ts` now parses the roster the
wrapper hands over in `FUSION_EVENTS_ROSTER` in addition to opening the log and
reading `session.history_file`. Neither row restates the module header.

**`docs/upgrading-to-v10-21.md`**, new, in the short form
`docs/upgrading-to-v10-20.md` established rather than the long form of the v10.4
note. It says what a consuming project sees on its next Setup: one file appears
at `fusion-workbench/shared/checkouts/<8hex>.md` and nothing else on disk
changes, no existing record is rewritten, no marker moves, and no line of
`orchestrator-events.jsonl` is touched. It names the one question Setup asks once
per checkout and why declining everything still writes the entry; it states that
no field carries a hostname, an account name or a folder path, by decision; it
names the four display sites and says every one of them renders the hex where
nothing resolves; it says `other_people` can go down and that this is the
correction landing, while `/fusion:next`'s claim comparison is untouched; it
names the mint's new stderr lines; and it carries a section of its own saying
that deleting the store restores v10.20 behaviour exactly, with nothing degraded
and nothing warned.

**The version, and which component moved.** 10.20.0 to **10.21.0**, the minor.
The Circle adds a helper, a store, one changed comparison and four display sites
and removes nothing: no signature is dropped, no exit code moves, the sixth
`party=` field is appended so a consumer reading five is unaffected, and an
absent store reproduces the previous behaviour from the same code path. A patch
would understate a new user-visible surface; a major would claim a break that
does not exist. Three of the four version surfaces the release process names are
now at 10.21.0: `.claude-plugin/plugin.json`, the `FUSION_REF=tags/v10.21.0`
example in `install.sh`'s header comment, and the same example in `README.md`
`## Install`. `README.md` also gained the upgrade pointer paragraph the docs row
of `CLAUDE.md` requires of every note.

**The two descriptions.** `plugin.json`'s `description` and the fusion entry's
`description` in the marketplace clone are **byte-identical**, compared by
loading both as JSON rather than by reading them side by side. They describe one
product. Neither was edited: this Circle's additions are below the altitude
either sentence works at, and editing one of a pair from inside the repository
that holds only one of them is how the pair drifted at v9.0.0.

## What was measured

`cd hooks && npm test` — exit **1**, 823 of 825 passing, two files red.

`monitor-warnings-panel.test.ts`, named in the dispatch as an intermittent bind
race, passed on both runs and needed no re-run.

**`citation-sweep.test.ts` — red, and not this diff's.** It was already red at
this session's start commit and the condition is filed. Every file it names is a
workbench record written by this Circle's earlier steps: the Circle record, six
history files under this Circle, and one shared history file carrying eight. No
file this step touched appears in the list, and none could: the gate's corpus is
`fusion-workbench/`, which this step did not write to beyond this log.

**`reference-resolution-lint.test.ts` — red, and it is this diff's**, in the one
class the dispatch anticipated. Every reference still resolves; what failed is
the pinned count, `paths` moving 1572 to 1583, with `anchors` at 218 and
`stampBare` at 13 both unmoved. **The baseline was deliberately not re-approved**,
on the dispatch's instruction that regenerating pins is a separate dispatch, so
the pin is left stale and named here rather than repaired. That departs from the
plan's own acceptance criterion for this step, which asks for a green
`reference-resolution-lint`, and from the gate's own failure text, which says
re-approval is the expected response and part of the change. The departure is
recorded rather than smoothed over.

The shares were measured by single-file revert against HEAD, which is what the
re-approval convention requires, so the next dispatch does not have to derive
them again:

| Reverted alone | `paths` | Share |
|---|---|---|
| `CLAUDE.md` | 1582 | +1 |
| `README.md` | 1581 | +2 |
| `README-hooks.md` | 1583 | 0 |
| `install.sh` | 1583 | 0 |
| `docs/upgrading-to-v10-21.md` removed | 1574 | +9 |
| all five reverted together | 1572, 38 of 38 passing | — |

The shares sum to 12 against a move of 11, and the overlap is one token rather
than a measurement error: `README.md`'s new paragraph cites
`docs/upgrading-to-v10-21.md`, which resolves only while that file exists, so
removing the note takes both the note's own nine and that pointer, and reverting
`README.md` takes the pointer as well. Counted once, the move is
9 + 1 + 1 = 11. The whole-diff revert confirms HEAD at exactly 1572, so no share
is owed to any file this step did not touch.

`bin/fusion-prose-metric docs/upgrading-to-v10-21.md` reads 0 em-dashes over 808
prose words.

`derivable-enumerations-lint` is green, which is the half of the acceptance this
step met: `CLAUDE.md`'s Layout table has one row per `bin/` helper.

## What is outstanding

- **The marketplace `marketplace.json` still reads 10.20.0.** It is outside this
  step's scope by the dispatch and is named here so whoever releases does not
  miss it. Its clone is at
  `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`.
- **The tag and both pushes.** Not made here. The plan's stopping section puts
  `bin/fusion-review-coverage --since v10.20.0` in front of the tag, with its
  result stated in the release commit or the session log; that is step 13.
- **The `reference-resolution-lint` baseline**, stale at 1572 against a measured
  1583, with the shares above.
