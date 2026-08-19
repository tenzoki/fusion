The archive skill's never-archive list omits the migration backup store while naming its twin
---
Safety filter 1 in `skills/archive/SKILL.md:96` reserves `$WORKBENCH/stashes/` from archiving but does not name `$WORKBENCH/.migration-v2-backup/`. The two are the same class of store — frozen legacy content left behind by a removed mechanism — and every other shipped consumer that excludes one excludes both. Fixing it changes shipped behaviour, so it is a decision to take on its own merits, not a correction.
---
**Found while** fixing `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1938_*_the-always-on-conventions-file-says-four-consumers-exclude-two-stores-and-one-of-them-excludes-one.md`. That defect was in the *sentence* in `rules/fusion-workbench-conventions.md:64`, and it has been corrected there to state the measured split. This record carries the other half: whether the archive skill's list is right as it stands.

**Measured at HEAD**, the four consumers the conventions file names:

| File | `stashes/` | `.migration-v2-backup/` |
|---|---|---|
| `skills/setup/SKILL.md:60,67` | yes | yes |
| `skills/log-activity/SKILL.md:82,89` | yes | yes |
| `skills/archive/SKILL.md:96` | yes | **no** |
| `agents/playmaker.md:61` | yes | yes |

**The argument for adding it.** Safety filter 1 is a list of workbench **root entries** — `monitor`, `stilwerk/`, `stashes/`, the root-anchored session and guard surfaces. Not one of those is reachable by a tier survey: every tier resolves its candidates through a `$SCAN_*` key (`skills/archive/SKILL.md:47-64,120-134`), and no `SCAN_*` key resolves into any of them. So the list's purpose is not to fence off the tier surveys. It is a guardrail for the **natural-language mode** (`skills/archive/SKILL.md:71`), where the user describes what to move and the skill surveys freely. In that mode a request like "archive the old stuff at the workbench root" reaches `.migration-v2-backup/` exactly as it would reach `stashes/`, and only one of the two is protected. The asymmetry between two stores of one class, on one line, has no stated reason anywhere in the file.

**The argument against, and it is why this is filed rather than fixed.** Adding the line changes what the skill does with a directory a real workbench may be carrying: a project that *wants* its v2 migration backup swept into the archive store would stop being able to ask for it in natural-language mode without an explicit override. That is a behaviour change, and the source record above named it as such — its option 2, "a decision, not a correction, and it should not be taken as the cheap way to make a sentence pass."

**Deliberately not done here.** The conventions sentence has already been corrected to the measured split, so nothing in the shipped text now depends on this being resolved either way. There is no pressure to decide it quickly, and no sentence goes false while it stands open.

**What resolving it looks like.** Either add `$WORKBENCH/.migration-v2-backup/` to the `skills/archive/SKILL.md:96` list and update the conventions sentence back to "four consumers exclude both", or record that the omission is intended and say why on the line itself, so the next reader does not re-open it.

**Found by:** coder, while fixing the conventions sentence. `git:d33cd22` plus the working-tree correction to `rules/fusion-workbench-conventions.md:64`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). Filed as a defect and reading as a decision, by its own words: "fixing it changes shipped behaviour, so it is a decision to take on its own merits, not a correction". The asymmetry is unchanged at HEAD (`skills/archive/SKILL.md:96` lists the stash store only) and is now documented rather than hidden (`rules/fusion-workbench-conventions.md:64` names the archive skill as the exception). Surfaced in this pass under "Misfiled — should be a decision". Marker stays open.
