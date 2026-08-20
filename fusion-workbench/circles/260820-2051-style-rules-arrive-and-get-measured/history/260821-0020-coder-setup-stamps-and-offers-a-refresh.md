# Coder — Setup stamps what it copies, and offers a refresh when the plugin has moved

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-21
**HEAD at dispatch:** `b22525d`
**Domain:** code

---

## What was asked

Step 3 of `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_o_plan-style-rules-arrive-and-get-measured.md`:
a stamping clause on `/fusion:setup` Step 0d, a new Step 0e that compares every asset Setup copies
into the workbench against the shipped copy, the new root surface written into the layout tree and
into the tracked/untracked split, and the `CLAUDE.md` correction the source question forces.

## What was built

**`fusion-workbench/.asset-provenance`**, one line per asset in the shape `shasum -a 256` prints —
checksum, two spaces, the asset's path relative to the workbench. It is the third input that makes
"is this copy stale, or did the project adapt it" decidable; the two files alone are one difference
with two causes.

**Step 0d** keeps its `[ -f ]` guard unchanged and stamps only what this run actually copied. A file
already present is deliberately left unstamped: nothing observed at that moment says what it was
given, and a guess is what the record exists to prevent. **Step 0b** stamps the monitor the same way;
it never produces an offer, because it is re-copied unconditionally and so is never the stale copy.

**Step 0e** classifies each of the four stylometric profiles in a stated precedence, which is the
branch order of the shipped block rather than a preference:

| verdict | condition | what Setup does |
|---|---|---|
| `case1-equal` | project == shipped | reports nothing; stamps |
| `case0-unclassifiable` | differs, nothing recorded | names it, says fusion cannot classify it, offers with that warning |
| `case2-stale` | project == recorded, shipped moved | offers the replace |
| `case3-adapted` | project moved, shipped == recorded | silent, untouched |
| `case4-conflict` | both moved | named as a conflict, no one-click replace, unstamped |

Without the precedence, case 1 and case 4 both match whenever both copies moved to the same content.

One `AskUserQuestion` covers cases 0 and 2 together, and none is asked when that set is empty. Both
answers stamp the **shipped** checksum: on yes after the replace, on no instead of it. The decline
stamp is what records "this divergence was seen and kept" — the file becomes `case3-adapted` on the
next run and re-raises only when the plugin moves again.

The shipped root is `$FUSION_SRC`, from `bin/fusion-source-root` behind its `[ -x ]` guard.
Comparing against `$FUSION_PLUGIN_ROOT` would offer this repository the pre-release text, because
`install.sh` reads a GitHub tarball and never the work tree. `UNRESOLVED` skips the step outright.

## Files changed

- `skills/setup/SKILL.md` — Step 0b stamp, Step 0d stamp loop, new Step 0e, two header corrections, one Done-report line
- `rules/fusion-workbench-conventions.md` — the tree line and one paragraph
- `rules/workbench-tracking.md` — `.asset-provenance` on the record side of the split
- `CLAUDE.md` — the `bin/fusion-source-root` row's copied-asset clause, and the same clause in `## Conventions`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — baseline re-approval with its per-file attribution
- `hooks/lib/__tests__/fixtures/{rules-emission,surface-growth}.golden` — regenerated

## Acceptance, as observed

Six scratch workbenches under `/tmp/fx`, driven with the shell blocks extracted from the shipped
skill body rather than retyped.

1. copy == recorded, shipped moved → `case2-stale`, offered; declining left `given-v1` in place, accepting wrote the shipped bytes.
2. project edited, shipped unmoved → `case3-adapted`; content and provenance line both untouched.
3. both moved → `case4-conflict`; not replaced, not stamped.
4. two consecutive runs on the accepted, the adapted and the conflict project: identical output, no file changed.
5. workbench with no `.asset-provenance`: the two differing files named `case0-unclassifiable`, the two matching ones silent.
6. after declining, the next run reports `case3-adapted` — no second offer — and the run after that changes no file.
7. `npm test` — 40 files, 716 tests, exit 0.
8. `skills/` bound green. Cost 6 952 bytes on `skills/setup/SKILL.md` against 8 547 of head-room, leaving 1 595. The always-on rule core grew 669 bytes against 5 704 of its own head-room, leaving 5 035.

Also run against this repository's real workbench: both chat profiles come back
`case0-unclassifiable`, which is the live instance of
`shared/issues/260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`.

## Records touched

- Plan step 3 marked `[DONE]`.
- `shared/issues/260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md` closed, `_o_` → `_c_`.
- `shared/issues/260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md` annotated, marker unchanged: the mechanism exists, the divergence closes at plan step 8.
- The spec's traceability table cited the closed issue with a literal `_o_`, which `workbench-citation-lint` reddened the moment the marker moved. That one row now spells `_*_`; the table's other rows were left as they are, since only this one dangled.

## Left open

Both decisions the step was written against are still `_o_`. Neither was transitioned here — an open
decision is the user's to answer, and the plan is written against the recommendation in each:

- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2324_*_where-does-the-copied-asset-provenance-record-live.md` — option 1 built.
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2324_*_is-the-work-tree-the-refresh-source-when-setup-runs-in-the-plugins-own-repository.md` — option 1 built.

The narrow reading held. Nothing in it required widening part (c) of `260810-1544`.
