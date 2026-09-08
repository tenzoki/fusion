# Coder — Step 16: documenting the four surfaces this Circle changed

**Status:** Complete
**Agent:** coder
**Date:** 2026-09-08
**Checkout:** 5e8248d7
**Filed by:** Kai Stalmann <ks@qantr.com>
**Source:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 16`

## What was done

Two shipped documentation files, plus the one re-approval the reference gate required.

**`CLAUDE.md`, five rows.** The turn-budget helper's row no longer describes the program as
the Turn budget alone: it opens on the orchestrator's configured values, names the second
one as the wall-clock minutes after which a bound agent's dispatch is asked to stop, says
why the helper keeps the budget's name, corrects "the `KEY=value` line it prints" to the
plural with its fixed order, and replaces "one of the loader's two settings" with all three
leaves named and one statement that their defaults are defined once. The events helper's
row opens on its three subcommands by name instead of a numeral and gains one clause for
the third; the sentence beginning "Two quantities, not one" is rewritten as "Presence and
Turns are distinct quantities", which keeps its point and drops a count that a third
subcommand had made stale. A new Layout row for the bounded-dispatch rule file states its
authoring scope and its two audiences by their two routes. The configuration file's row
separates what this repository sets from what the loader's live leaves are, which were one
sentence and are now two, because the third leaf is a live leaf this repository does not
declare. The commit-lock row gains one clause naming what its rule file now also carries.

**`README-hooks.md`, four passages.** The entry point's row and the `lib` row both said
"the two identity-scoped readings" and now name three, the second describing
`measureDispatchDurations` and its three partitioning counts; the sentence about the
asymmetry between the readings now says "the first two". Beyond the plan's letter, two
further passages in that file carried enumerations this Circle had falsified and are
corrected: the turn-budget module's row, which said the budget was one of two settings, and
the per-project configuration section, which opened "What it configures is" and named two
leaves. Both are named in the report as departures from the dispatch's row list, taken
against the step's own acceptance criterion that no count in prose disagree with the tree.

**No row was added to the `hooks/lib` table**, no byte figure from Step 15 was written into
`CLAUDE.md`, and no record citation was added in any form, so the corpus the citation gate
reads is unchanged in that respect.

## Verification

`cd hooks && npm test` — exit 0, 55 files and 947 tests passing, with the three named gates
green. `bin/fusion-citation-sweep --dry-run` — exit 0, `rewrites=0`.

The reference gate moved and was re-approved by measurement, not by widening: paths
1724 -> 1727, anchors and stampBare unmoved. Both directions were measured by single-file
revert against the full tree. `CLAUDE.md` at HEAD with the hooks README as written reads
1724 and passes; the hooks README at HEAD with `CLAUDE.md` as written reads 1727. So the
whole movement is `CLAUDE.md`'s and the hooks README owes none of it, which is a property
of that file's edits rather than luck: every plugin file its new passages name already
stood in the same row. The three are two passages — the new Layout row names the rule file
and the rules helper, and the commit-lock clause names the orchestrator prompt. The full
account is in the re-approved comment in
`hooks/lib/__tests__/reference-resolution-lint.test.ts`, rewritten in place with no line
added.

No growth baseline moved and none could: this step edits no agent prompt, no skill body, no
rule file and no hook test body, so `AGENT_BASELINE`, `RULE_BASELINE`, `SKILL_BASELINE`,
`TEST_LINE_BASELINE`, `RELEASE_CAP` and `DRIFT_CEILING` are byte-identical and both goldens
are unreachable from this edit.

## What was not done

The plan file's own `### 16` heading still reads `[IN PROGRESS]`. The dispatch named
`CLAUDE.md` and `README-hooks.md` and no others, so the marker is left to the dispatcher.
