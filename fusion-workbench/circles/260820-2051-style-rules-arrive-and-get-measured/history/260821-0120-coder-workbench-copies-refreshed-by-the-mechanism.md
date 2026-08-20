# Step 8: the workbench copies are refreshed by the mechanism, not by hand

**Agent:** coder
**Date:** 2026-08-21 01:20
**Status:** Complete
**Plan:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_o_plan-style-rules-arrive-and-get-measured.md`, step 8

## What this step was

Not an edit to the four stylometric profiles. The four workbench copies under
`fusion-workbench/stilwerk/` were refreshed by running the distribution mechanism step 3
built into `skills/setup/SKILL.md`, so that the mechanism is demonstrated end to end rather
than asserted. A hand copy would have produced the same bytes and proved nothing.

## What was run

The shell blocks of `skills/setup/SKILL.md` were extracted and run verbatim, in the order the
skill states them, with `$FUSION_SRC` substituted by the path the source-root block printed.
Nothing was reimplemented and no `cp` was issued outside those blocks.

### 1. The source root

The head-of-file resolution block printed:

```
source root: /Users/k1/Projects/productive/fusion
FUSION_PLUGIN_ROOT=/Users/k1/.fusion
```

The work tree, not the install copy. That is the behaviour step 3 built the comparison to
have, and it is what lets an unreleased profile revision reach this repository's own
workbench without a release.

### 2. Step 0d, the guarded copy

Copied nothing and stamped nothing, both correct: all four profiles were present, and only a
file the run actually copies is stamped. Its one effect was to create
`fusion-workbench/.asset-provenance` empty, which the repository did not have before.

### 3. Step 0e, the classification

```
stilwerk/default-voice-en.yaml case0-unclassifiable
stilwerk/default-voice-de.yaml case0-unclassifiable
stilwerk/chat-voice-en.yaml case0-unclassifiable
stilwerk/chat-voice-de.yaml case0-unclassifiable
```

Four times case 0, which is the predicted result for a workbench that predates the record:
the copies differ and no checksum was ever recorded, so fusion states that it cannot tell an
adaptation from a stale copy and carries that warning into the offer. The offer covers all
four in one question, as the skill requires, and it was accepted per the dispatch.

### 4. The replace and the stamp

The replace loop and the stamp loop ran over all four. `fusion-workbench/.asset-provenance`
then carried four lines:

```
dee5354798e93e8b27408b1804532d14ac787a96b4e6b58eb76924c9a6f9fca2  stilwerk/default-voice-en.yaml
659038a7cecf38a058857ae95b5d06643c4875a512f90a7578a38adc4cd795ca  stilwerk/default-voice-de.yaml
202b63fc9b40d4a06a4f9b4c9a3d7809538cff6e6be7d68c6ee9cab165ddaaad  stilwerk/chat-voice-en.yaml
9ffc47ea42889ef30501c623cc4fd441e8b23627f7634c833d2afa9ae83bef87  stilwerk/chat-voice-de.yaml
```

### 5. The second run

Re-running the classification block printed `case1-equal` four times, and the stamp loop
rewrote nothing: the checksum of the provenance file was identical before and after. That is
criterion 4 of step 3, two consecutive runs with no change in between, observed on a real
workbench rather than a scratch one.

## Acceptance

1. `diff -r stilwerk fusion-workbench/stilwerk` exits 0 with no output.
2. `shasum -a 256 -c .asset-provenance`, run inside the workbench so the recorded relative
   paths resolve, reports `OK` on all four. The checksums were verified against the files
   they name, not merely counted as lines.
3. No profile was edited by hand. `git status --porcelain` scoped to the two directories
   lists the four workbench copies modified and the provenance file new, with `stilwerk/`
   itself clean, so what landed is exactly step 7's committed output. The commands that wrote
   the files are the two loops quoted in `skills/setup/SKILL.md` Step 0e.
4. `bin/fusion-prose-metric $(bin/fusion-rules coder)` moved the chat profile row from
   2 em-dashes in 617 prose words (3.2 per 1000, over) to 0 in 628 (0.0 per 1000, ok). The
   full table is below.

### The table, before and after

```
before
file                                                                        em-dash   words  /1000  permit  verdict
rules/agent-setup.md                                                             15     502   29.9       0  over
rules/fusion-workbench-conventions.md                                           115    7840   14.7       7  over
rules/decision-record-examples.md                                                10     341   29.3       0  over
rules/user-facing-output.md                                                       1    2248    0.4       2  ok
rules/critical-stance.md                                                         29    1557   18.6       1  over
./fusion-workbench/stilwerk/chat-voice-de.yaml                                    2     617    3.2       0  over
total (6 files)                                                                 172   13105   13.1      13  over

after
file                                                                        em-dash   words  /1000  permit  verdict
rules/agent-setup.md                                                             15     502   29.9       0  over
rules/fusion-workbench-conventions.md                                           115    7840   14.7       7  over
rules/decision-record-examples.md                                                10     341   29.3       0  over
rules/user-facing-output.md                                                       1    2248    0.4       2  ok
rules/critical-stance.md                                                         29    1557   18.6       1  over
./fusion-workbench/stilwerk/chat-voice-de.yaml                                    0     628    0.0       0  ok
total (6 files)                                                                 170   13116   13.0      13  over
```

The five rule rows are unchanged by design: they are steps 9 to 12, and this step touches
none of them. The corpus total stays over the ceiling until those four land.

## What this step makes true for every later step

`bin/fusion-rules` reads the workbench copies, not the shipped ones, so until this step ran,
every agent dispatched in this repository was still loading the pre-revision profiles,
including the ones that performed steps 5 to 7. From this commit onward they load what the
plugin ships.

## Files changed

- `fusion-workbench/stilwerk/default-voice-en.yaml`
- `fusion-workbench/stilwerk/default-voice-de.yaml`
- `fusion-workbench/stilwerk/chat-voice-en.yaml`
- `fusion-workbench/stilwerk/chat-voice-de.yaml`
- `fusion-workbench/.asset-provenance` (new, untracked; `rules/workbench-tracking.md`
  classifies it as a record, so it belongs in the commit)
- the plan file, step 8 marked `[DONE]` with its note

## Verification

`cd hooks && npm test`, exit 0. 40 test files, 718 tests, all passed.
