# Release mechanics for v10.24.0 and the upgrade note

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Prepare the three in-repository version surfaces for v10.24.0, read `plugin.json`'s description
against the release without rewriting it for its own sake, and write `docs/upgrading-to-v10-24.md`.
Scope named four files. No tagging, staging, committing or pushing.

## What was done

Three version surfaces, 10.23.0 to 10.24.0 in each:

- `.claude-plugin/plugin.json` `version`.
- `install.sh` header comment, the `FUSION_REF=tags/v<version>` worked example.
- `README.md` `## Install`, the `Overrides:` line's pin example.

The fourth surface, the marketplace entry, is in the other repository and was not looked for.

`docs/upgrading-to-v10-24.md` is new. It opens by saying nothing is rewritten, follows the shape of
the v10.3 and v10.4 notes, and carries: the write-time citation-form report, the checker's new
`unrewritable-violations=` figure and per-row column (the longest section, as dispatched), the
monitor's port 0 and `MONITOR_URL_FILE`, the per-session commit-message path, a section of its own
for the git-helper timeout collapse that ships open, and an "Also in this release" carrying the
foreign-record citation form, four repairs inside the citation instrument, and the test suite's
moved default deadline.

Two things were found while writing and are stated rather than smoothed over. The release also
changed the citation grammar (the foreign-record form and four repairs, commits `9127acfc` and
`12dee877`), which the dispatch's list of what a project meets did not name; the note carries them
so that its "What did not change" section does not falsely claim an untouched grammar. And the
`README.md` `## Install` section carries one "Upgrading from ...?" paragraph per shipped note and
has none for v10.24; that was left for the dispatcher to decide rather than added, since the
dispatch named only the pin line.

## Verification

`cd hooks && npm test` exits 1. One test fails,
`reference-resolution-lint.test.ts > resolved exactly the pinned number of references in each
plugin class`: the pin expects `{paths: 1631, anchors: 225}` and the tree resolves
`{paths: 1643, anchors: 227}`.

The whole delta is the new documentation file, measured rather than inferred: with
`docs/upgrading-to-v10-24.md` moved out of the tree that file passes, and with it back the pin is
over by twelve paths and two anchors. The gate's own failure text names re-approving the baseline
as the expected response. It was not done here, for two reasons: the file holding the baseline is
outside the dispatched scope and is one of the files a sibling agent was editing at the time
(`hooks/lib/citation-scan.ts`, `hooks/lib/citation-form.ts` and this same test file were all
modified in the working tree), and that sibling's pending work can move the same two counts again,
so the re-approval belongs after both changes land rather than before.

Also checked, both clean: `bin/fusion-prose-metric docs/upgrading-to-v10-24.md` reports 0 em-dashes
over 2 486 prose words, and the work-tree `bin/fusion-citation-check` reports `verdict=clean` with
`edited-violations=0` and no row in the new file.

## The description, read and left alone

`plugin.json`'s `description` still describes what fusion is after this release, so it was not
edited. Its hook clause enumerates what the hooks machine-write, and the write-time citation-form
report is not in that list, but the same clause already omitted the review-coverage and staging
measurements, which predate this release. The omission class is older than v10.24 and was not
created by it.
