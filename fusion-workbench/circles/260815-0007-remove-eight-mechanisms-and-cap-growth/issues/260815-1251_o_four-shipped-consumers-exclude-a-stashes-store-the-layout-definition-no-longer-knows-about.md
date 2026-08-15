# Four shipped consumers exclude a stashes/ store the layout definition no longer knows about

---

`5d29b6d` removed `stashes/` from the layout tree in `rules/fusion-workbench-conventions.md`, the
file that declares itself the single authoring home for the workbench layout. Four shipped surfaces
still exclude that directory, one of them in executable shell. The next editor of any of the four
meets an exclusion for a directory no definition file mentions, and the argument for keeping it
lives only in a commit message.

---

**Severity:** Low — nothing is broken today; what is missing is the written reason the four exclusions must stay.
**Domain:** code
**Filed by:** `coderev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1251-coderev-turn-2-build-churn-and-stash.md`)
**Owner:** `coder`, or the `curator` at gate G1 if it is treated as normative prose
**Affects:** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`; `skills/setup/SKILL.md:60,64,67`; `skills/log-activity/SKILL.md:82,89`; `skills/archive/SKILL.md:96`; `agents/playmaker.md:63`

**Verified 2026-08-15 at HEAD `5d29b6d`.** All four exclusions present; `stashes/` absent from the layout tree.

## The four, all intact and all correct to keep

| Site | Form |
|---|---|
| `skills/setup/SKILL.md:67` | `-not -path '*/stashes/*'` in the bracket-marker probe's `find` |
| `skills/log-activity/SKILL.md:82` | `-not -path '*/stashes/*'` in the activity scan's `find` |
| `skills/archive/SKILL.md:96` | `$WORKBENCH/stashes/` in the never-archive list |
| `agents/playmaker.md:63` | "any `stashes/` a workbench still carries from the removed stash skills" |

`skills/setup/SKILL.md:60` and `:64` and `skills/log-activity/SKILL.md:89` carry the prose that
justifies two of them, and both were correctly updated by `5d29b6d` to say the skills are gone.

## What is missing

`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` now lists `archive/` and not
`stashes/`. The tree is normative — the file says of its root-anchored block that "the list is
exhaustive as written" — and a reader deriving the workbench's store set from it will not find
`stashes/`. `.migration-v2-backup/` has the same shape and has never been in the tree, which is
the precedent the executor followed; it is also the precedent that makes the class invisible.

The cost is concrete rather than tidy. `skills/setup/SKILL.md:60` states that dropping the
exclusions turns the bracket-marker probe into a permanent Setup refusal that routes to a
`/fusion:migrate` which reports nothing to do — "a deadlock rather than a mere false positive, and
it was hit twice on one consuming project". That protection now rests on prose inside the consumer
rather than on a definition anyone editing the layout would read.

## One over-claim to correct while fixing this, not to repeat

`5d29b6d`'s commit message says: *"a project that stashed before today still holds a frozen Circle
there, and an unexcluded setup probe reads its bracket-marker filenames as an unconverted workbench
and refuses Setup permanently."*

`skills/setup/SKILL.md:60` records the measurement that sentence leans on, and it says the opposite
about `stashes/` specifically: 1146 matches, *"all of them under `archive/` and
`.migration-v2-backup/`, none anywhere else"*. A stash written after the v4 underscore conversion
carries underscore markers, so it produces no match at all; only a stash of content that itself
already carried bracket markers would. The exclusions are right to keep — they cost nothing and a
frozen store is not live content, which is the stated principle — but the reason is the principle,
not a measured hit. `rules/critical-stance.md` §3: an inference stated as a measurement.

## What it would take

One sentence under the layout tree in `rules/fusion-workbench-conventions.md`, naming `stashes/` and
`.migration-v2-backup/` together as legacy stores a workbench may still carry, saying that nothing
shipped creates either any more, and that four consumers exclude both because frozen content is not
live content. Restoring the tree line is the wrong fix: it would read as a store the plugin still
writes.

## Related

- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`
- `history/260815-1032-coder-stash-pop-removal-and-commit-lock-rehome.md`
- `skills/setup/SKILL.md:60` — the measurement, and the deadlock it records
