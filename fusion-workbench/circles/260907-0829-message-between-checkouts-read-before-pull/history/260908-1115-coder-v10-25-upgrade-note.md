# The v10.25 upgrade note, and the release paragraph in the project README

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Write `docs/upgrading-to-v10-25.md` covering four things in a fixed order (the update-and-restart
precondition, the second question inside the cleanup pipeline's single stop, the new
`orchestrator.dispatchMinutes` configuration leaf, and the one defect that ships open), point at the
messaging page rather than restating it, and update the README's release paragraph. Keep it short.
Do not claim the reading command has run end to end.

## What was done

Two files written, one gate baseline re-approved.

`docs/upgrading-to-v10-25.md`, 137 lines. Filename convention and register taken from the existing
notes: title `# Upgrading to v10.25 (from v10.24)` as v10.24's note has it, the tag and `FUSION_REF`
pin in the opening, and the four closing sections every note carries (`## What you have to do`,
`## What did not change`, `## Where to read more`, and the closing line about the source repo's
workbench). Sections, in the order the dispatch fixed:

1. **Nothing new works until you update and restart.** The roster and helper set are read once at
   session start; the skill's first step reports the helper miss and stops rather than improvising.
   The candour paragraph sits here, because the reason the command is unproven is the same rule the
   section is about: `/fusion:news` has never been invoked as a slash command, the layer under it is
   covered by nine tests against scratch repositories, and the writing body was followed by hand
   once to produce the first entry.
2. **One stop, two questions.** The walk-away property is stated as intact, with `--skip claude-md`
   leaving no message at all and `--dry-run` putting no draft, plus `--only forum` as the way to
   reach the half alone. The push-ordering cost and the fourteen-day retention are one sentence each
   and cite the page.
3. **`orchestrator.dispatchMinutes`.** Read from `hooks/lib/config.ts` and the two commits rather
   than from the name: the leaf, its validation and single diagnostic, the second `KEY=value` line on
   the existing helper and why it rides that helper, and then the part a name would not give a
   reader, that no prompt or skill reads the value in this release. The default's measurement (131
   dispatch pairs, 15 over 20 minutes, four candidates checked) comes from the comment beside the
   default.
4. **The open defect**, in its own section with the wording unsoftened: an untracked workbench
   answers `new=0` on a successful exit forever, the rendered sentence is indistinguishable from the
   true one, the configuration is supported rather than a misuse, and the record is cited in the
   storeless wildcard form.

`README.md`: a new `**Upgrading from v10.24?**` paragraph inserted above the v10.24 one, following
the stack the section already keeps (newest first, one paragraph per release, each naming its note).
The `FUSION_REF` example already read `tags/v10.25.0` and was not touched.

## What was verified

- `cd hooks && npm test` — **exit 0**, 924 tests in 53 files.
- `bin/fusion-prose-metric docs/upgrading-to-v10-25.md` — exit 0, `ok`: 0 em-dashes in 1346 prose
  words against a permit of 1.
- `bin/fusion-citation-check` — exit 0, `verdict=clean`, `edited-violations=0`. Neither edited file
  appears in any violation row; the three rows whose text mentions this session's subjects are
  pre-existing, unedited and unrewritable.

**One pinned count moved and was re-approved in place**, in the reference-resolution gate:
paths 1696 to 1713, anchors and stampBare unmoved. Attributed by single-file revert against the full
tree rather than by reading the diff. With both files absent the gate reads 1696/237/14 green; with
only the README paragraph restored it reads 1698; with the note restored beside it, 1713. So the
paragraph carries 2 and the note 15, and every reference in both resolves, since the dangling test
passes on the same tree. The baseline line was rewritten in place with the previous approval kept
behind `Previous:`, exactly as the last two approvals did. **No growth baseline was edited**, and
none had to: the documentation directory and the README are not bounded surfaces, and the baseline
line was rewritten rather than added to.

The three load-sensitive harness cases recorded in the open records did not fire on either full run
of this task.

## What was not done

No commit and no whole-tree git command; the working tree carries the changes for the dispatcher to
commit. `docs/fusion-intro.md` was already modified in the tree when this task started (one table
row naming the new command) and was left exactly as found. Nothing else in `docs/` was touched, and
no growth baseline, agent prompt or skill body was edited.
