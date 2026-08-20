# Coder — release material for v10.4.0

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-20
**HEAD at dispatch:** `30d6f0a`
**Domain:** code

---

## What was asked

Write `docs/upgrading-to-v10-4.md`, move the three version surfaces to `10.4.0`, add a v10.4
paragraph to the two per-version "coming from" pointers, and read the manifest `description`
against what v10.4 ships. Tagging, pushing and the marketplace repository were explicitly out of
scope and were not touched.

## The correction the dispatch needed

The dispatch's headline was that "three new blocking tests can now fail a consuming project's
suite". **That is not what they do**, and the note was written to the measured behaviour instead.
Three checks, each verifiable:

- `hooks/lib/__tests__/helpers/citation-scan.ts:61-63` — `workbenchRoot` is
  `join(pluginRoot, "fusion-workbench")`, the **plugin's own** workbench. A consuming project's
  workbench is never the corpus. `plan-stopping-section-lint.test.ts` imports the same constant.
- `install.sh:82` copies `.claude-plugin agents skills rules hooks bin stilwerk templates docs`
  plus the READMEs and `LICENSE`. No `fusion-workbench/`, no `.git`, and line 91 deletes
  `hooks/node_modules`. An installed `~/.fusion` has no workbench, no git objects and no runner.
- Both workbench gates fail loudly rather than passing vacuously when the workbench is absent, so
  a deliberate run in an install copy reports "scanned nothing" instead of green.

`committed-dist.test.ts` needs `git show HEAD:` against the plugin repo, which an install copy
also does not have.

The audience is whoever works in a checkout of the fusion source. The note says that in its first
section, before describing the gates, because it is the sentence most likely to be got wrong.

## What the note carries

Derived from `git log --oneline v10.3.0..HEAD` and the diff, not from the dispatch summary.

- The three gates, with the citation gate's design stated as the brief asked: recomputed corpus,
  no baseline, marker moves redden the suite for whoever moves them, and the example allowlist
  named as **not** the remedy (which is the gate's own failure text).
- **The one run-time behaviour change**, given its own section: the shaper's `**Initiated by:**`
  is now required on every portfolio-activation run, top-level included. This is the only thing
  in the release that can stop a run that previously succeeded.
- `analyst`'s `*analyst*` pattern, with the orphaned-`investigator-capture-layout.md` case.
- `Retired:` widened to `_a_`; the statement-versus-pointer citation convention; and the
  Circle-deletion annotation added to `rules/circle-records.md`, which the dispatch did not
  mention and which binds a human rather than an agent.
- `## What did not change`, modelled on the v10-3 note's own section and checked item by item.

## Version surfaces and pointers

`.claude-plugin/plugin.json` 10.3.0 → 10.4.0; the `FUSION_REF=tags/v10.3.0` example in
`install.sh`'s header and the same example in `README.md` both → `v10.4.0`. The marketplace entry
was left alone as instructed.

`README.md` `## Install` and `skills/help/SKILL.md` §update each gained a v10.4 paragraph in the
register the existing ones use. The v10.3 paragraph was reworded in both: it is no longer the
newest, so the chain tails now read "and the v10.4 note above applies as well" and the
v10.0/v10.1 paragraph's tail names both notes.

## The two prose descriptions

**No change needed, and none made.** `.claude-plugin/plugin.json` `description` and the
marketplace entry's are byte-identical today. Every claim in it was read against what v10.4
ships and each still holds: the agent roster and the three domain-parameterised agents are
unchanged, the hook layer is untouched, the curator and the monitor are as described. Nothing
v10.4 adds is a product surface a user of the plugin meets — the three gates are development-time
only — so there is nothing the description omits. `CLAUDE.md`'s release section names this as the
surface that drifts because each install path shows only its own; an unnecessary rewrite is how
the two come apart.

## Gates and constraints

- **Growth bounds, measured.** `agents/` untouched, head-room unchanged at 2 259 bytes.
  `skills/` 230 881 → 231 892 (`help/SKILL.md` +1 011), leaving 8 547 of 20 000. Hook-test lines
  20 233 → 20 259 (the baseline note below), leaving 116 of 2 500. The always-on rule set was not
  touched.
- **`surface-growth.golden` regenerated** with `UPDATE_SURFACE_GOLDEN=1`, per its own header. A
  regeneration moves no baseline and clears no bound; the diff is the two changed files and the
  two totals.
- **`reference-resolution-lint.test.ts` `BASELINE` re-approved** 1195/157/112 → 1223/160/112,
  with the note the gate's own message asks for. The three contributions do not sum in isolation
  because `README.md` and `skills/help/SKILL.md` both cite the new note: reverting the note alone
  gives 1198/157, not 1195/157. Solved: note 23 paths + 3 anchors, README 2 paths, help 3 paths.
  `records` did not move — the note cites no workbench record, deliberately, since it is read
  from an install that has none.
- **One gate caught a real defect in the draft.** `derivable-enumerations-lint` rejected
  `docs/upgrading-to-v10-4.md cites /fusion:circle-delete` — a phantom skill name I had taken
  from `rules/circle-records.md`, which is not on that lint's file set and so carries it
  unpunished. Rewritten as "a dedicated delete command".
- **The citation gate judged no edit of mine**: no workbench record was written or renamed. This
  log is in `history/`, which the corpus predicate excludes by name.

## Verification

`cd hooks && npm test` — exit 0, 716 tests, 40 files. Nothing was committed; the tree carries
seven changed or new paths and no `hooks/dist/` movement.

## Not done, by instruction

No tag, no push, no marketplace edit, no commit. `claude plugin validate .` and the
`--plugin-dir` smoke test were reported already passed at dispatch and were not repeated.
