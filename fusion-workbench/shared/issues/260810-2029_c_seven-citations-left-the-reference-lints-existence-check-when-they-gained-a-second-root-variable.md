Eight citations left the reference lint's existence check when they gained a second root variable

(The filename still reads "seven". A record's stamp and topic are immutable under
`rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` — only the marker
changes — and three live texts cite this record by that slug. The corrected count is eight; see the
correction note at the foot.)

---

`hooks/lib/__tests__/reference-resolution-lint.test.ts:212` defines `ROOT_VAR_RE`, which recognises
exactly two root variables: `$FUSION_PLUGIN_ROOT` and `$CLAUDE_PLUGIN_ROOT`. A citation written with
either is resolved and its target is checked to exist.

Session `260810-1646` introduced a third. Both skills now resolve a source root once —
`$FUSION_SRC`, which is the work tree inside the plugin's own repository and the install everywhere
else — and the eight citations of `agents/orchestrator.md` in `skills/setup/SKILL.md` (five) and
`skills/next/SKILL.md` (three) were rewritten to use it. `ROOT_VAR_RE` does not know the name, so all
eight silently dropped out of the existence check.

The suite stayed green throughout, which is the point: nothing failed, coverage simply shrank.

---

**What still covers the target, and what does not.** `queue-ground-lint` reads
`agents/orchestrator.md` by name and pins `### The queue's ground` to exactly one occurrence, so the
*file* and that one *heading* are not unpinned. What is gone is per-site coverage: eight individual
citations are no longer checked to resolve, and a future citation written with `$FUSION_SRC` to a
path that does not exist would be accepted by every gate the project has.

**The fix is small and its size is the trap.** Adding `FUSION_SRC` to `ROOT_VAR_RE` restores the
eight. It does not address why a gate's coverage can shrink without a single test turning red, and
that is the part worth thinking about for a minute before typing: this is the second coverage hole
this session found by reading rather than by running, after the domain cascade's second copy
(`260810-1918`). Both are the same shape — a gate that enumerates what it recognises, and a change
that adds a case the enumeration does not carry.

Consider whether the lint should fail on an *unrecognised* `$VAR/`-rooted citation rather than
skipping it. A skip is what makes the shrinkage silent; a failure on the unknown name would have
turned red the moment `$FUSION_SRC` appeared, and the fix would have been part of that change instead
of a record filed after the fact.

**Scope note.** The executor that introduced `$FUSION_SRC` reported this itself; `hooks/**` was
outside its assigned files, which is why it is filed rather than fixed.

**Filed by:** orchestrator, session `260810-1646`, on the rooted-citations executor's report.

---
Resolved: the gate now fails on an unrecognised root variable instead of skipping it, which is the
option this record asked to be considered rather than the cheap one it also named.

**What was built.** `ROOT_VAR_RE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` no longer
spells the recognised variable names into the pattern. It matches `$VAR/<path>` for any variable and
classifies the name against a new `ROOT_VARS` map: `true` means the variable names the plugin tree
and the remainder is existence-checked, a string means it names something else and carries the reason
for skipping it. A variable in neither position, standing in front of a plugin-shaped path, is a
violation whose message names both remedies. `FUSION_SRC` is declared `true`, so the eight sites are
back under the check.

**Why option 2 held, measured rather than assumed.** The worry was that the skill and agent bodies
carry `$VAR/` shapes that are not citations at all. They do: `$WORKBENCH`, `$WB` and nine `$OUT_*`
resolver keys account for 121 such tokens. None of them is a false positive, because the two classes
part on the remainder and not on the variable name. A resolver key is followed by a workbench store
path (`$OUT_ISSUE/<stamp>_o_<slug>.md`, `$WORKBENCH/monitor`); a plugin citation is followed by
`rules/…`, `agents/…`, `bin/…` or one of the four top-level plugin files. Measured over the whole
scanned surface, exactly four variables stand in front of a plugin-shaped path: the three plugin
roots, and `$STASH_DIR/README.md` at `skills/circle-stash/SKILL.md:439`, which is a stash's own
manifest. That one is the map's first string entry, and a falsifier test fails if it ever stops
shadowing anything, mirroring the two guards `EXAMPLE_PATHS` already carries.

**What the gate still does not see, stated in its own header.** A token under an unrecognised
variable whose remainder is not plugin-shaped stays skipped. That is not a residual so much as the
class boundary: a path no plugin directory could hold is not a plugin citation.

**Demonstrated, not asserted.** Both halves were shown failing against a scratch copy of the tree
(decision `260810-1820`, option 1) with two dangling citations planted in `skills/next/SKILL.md`:
`$FUSION_HOME/agents/no-such-agent.md` and `$FUSION_SRC/bin/no-such-helper`. The previous gate passed
the file at 23 tests green. The new gate reports both, the first as an unclassified root and the
second as a dangling plugin path. Six negative controls now hold that behaviour in the suite.

**Count corrected.** The seven this record claimed three times is eight, per
`260810-2110_*_the-citation-rooting-commit-and-its-own-record-both-say-seven-citations-and-there-are-eight.md`.
Re-measured independently here: `skills/setup/SKILL.md:220,238,239,254,260` and
`skills/next/SKILL.md:115,121,185`, and the root-variable token count over the whole surface moves
from 140 to 148 when `FUSION_SRC` is classified. The filename keeps the superseded number because a
record's topic is immutable and three live texts cite this slug.

---
**Reconciliation note — reconciler, 260811-0108, at HEAD `e2a34f0`.** The closure holds and the
corrected count of eight is right. The *line anchors* have already gone stale inside the same
session: this record and its sibling `260810-2110_*_…seven-citations…-and-there-are-eight.md` both
cite `skills/setup/SKILL.md:220,238,239,254,260` and `skills/next/SKILL.md:115,121,185`. At HEAD the
eight `$FUSION_SRC`-rooted citations of `agents/orchestrator.md` sit at `skills/setup/SKILL.md:222,
240,241,256,262` and `skills/next/SKILL.md:117,122,187` — every anchor moved two lines when `c714d8c`
landed, four commits after the measurement. Five plus three is still eight and the claim is intact;
only the anchors are wrong. This is the class the open record
`260808-0030_o_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md` is about,
now with a same-session instance.
