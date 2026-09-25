# User-facing documentation for cross-checkout messaging

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Write the user-facing conceptual doc for the messaging feature this Circle built: one new file under `docs/`, covering what the feature is for, how to use both halves, the shape of a message, the retention rule, the three limits the closure review found, and one worked example of the reading side's output states. Cite `bin/fusion-forum`'s header rather than restating its exit table or state vocabulary.

## What was written

`docs/messages-between-checkouts.md`, 1 321 prose words. Filename chosen against the directory as it stands: `docs/` holds two topic docs (`philosophy.md`, `working-model.md`), one German quick-start (`fusion-intro.md`) and thirteen `upgrading-to-v*.md` release notes. A topic noun-phrase is the register for a conceptual doc; a version-shaped name would have claimed to be a release note.

Sections, in order: what the gap is; the update-and-restart precondition, stated once; the reading command; the writing half inside `/fusion:cleanup` Step 6 with its three flag consequences and the accepted ordering cost; the two names and why they differ; the twenty-line shape with its two languages and a worked entry; the fourteen-day tier-1 retention with its accepted cost; the three limits; the two output states; and a closing pointer at the helper's header as the authoritative mechanism.

The three limits are stated without softening: an untracked workbench answers `new=0` permanently and says nothing (`260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md`), the read mark advances on render so an abandoned message does not return, and there is no thread. No claim is made that the feature has been used end to end; both output states are labelled as the shape the skill prescribes rather than a captured transcript.

## The one coordinated change the doc required

`hooks/lib/__tests__/reference-resolution-lint.test.ts` pins the number of references the gate resolves, and `docs/` is inside its scanned surface, so a new doc citing five plugin paths turns the suite red until the pin is re-approved. Re-approved to `paths: 1696` with the account the file's convention prescribes, written into the `BASELINE` line in place so no line is added to a surface the growth bound measures by the line. The move was attributed by single-file revert against the full tree, not by reading the diff: with the doc moved out of `docs/` and nothing else changed, the gate reads 1691/237/14 green.

## Pointer obligations: what was found

Nothing obliges a pointer at the new file, and none was added.

- `derivable-enumerations-lint.test.ts` reads every `docs/*.md`, but only in the open-set direction: prose may name any subset of the skills, and every name must resolve. It asserts no inventory of `docs/` anywhere.
- The three "where to read more" lists (`README.md` line 5, `docs/philosophy.md` `## Where to read more`, `docs/working-model.md` `## 6. Where to go next`) are curated selections, not inventories. None of them lists `docs/fusion-intro.md` or any release note.
- `CLAUDE.md`'s `docs/` row deliberately carries no inventory and says so.
- `skills/help/SKILL.md` routes by fixed topic, and a feature doc is not one of its topics.
- Both roster surfaces already carry the command: `CLAUDE.md`'s skill listing and the skill table in `README-agents.md`.

One gap was found that is not a pointer obligation and was not fixed, because it sits outside this dispatch: `docs/fusion-intro.md` section 10 is a command table in German, and it does not carry `/fusion:news`. No gate holds it, since the enumeration lint reads `docs/` in the open-set direction only. Reported to the dispatcher rather than repaired.

## Verification

- `cd hooks && npm test` — exit 0, 924 of 924 passing across 53 files.
- `bin/fusion-prose-metric docs/messages-between-checkouts.md` — exit 0; 0 em-dashes over 1 321 prose words against a permit of 1.
- `bin/fusion-citation-check` — exit 0, `verdict=clean`; the new file contributes no row.
