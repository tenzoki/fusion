A consuming project's guard config goes stale, and inheritance delivers changes nobody is told about

---
Measured on 260812 in `/Users/k1/Projects/productive/unite-co-creator`, the largest consumer. Its
`fusion-guard.json` is the seeded template, valid JSON, declaring nothing — so the plugin's full
default list is in force, `rules/**` included. That inheritance is the cause of the 53 records of
make-work the consumer analysis measured. Two separate mechanisms keep it that way, and neither has
an owner.

---
**Witness:** the file itself, read tonight
**Severity:** high — it is the mechanism behind the largest measured cost fusion imposes on a consumer
**Affected:** `templates/fusion-guard.json`, `hooks/lib/config.ts`, `skills/setup/SKILL.md`

## One: the template is a copy, and the copy has drifted

The consumer's file has six `_`-keys; the current template ships eight. The two missing ones are
`_guardEnabled` and `_turnBudget`, both describing behaviour that exists today. Worse than absence
is contradiction — two statements in their copy are now false:

- **`_override` describes the wrong merge.** Their copy: *"the merge is per top-level key: the
  object you write REPLACES the plugin's object of that name whole — it is not merged field by
  field"*. Current fusion merges **per leaf** (`hooks/lib/config.ts`, `CONTAINER_LEAF_RULES`). A
  reader following their own file's instructions predicts the wrong outcome for every partial
  declaration.
- **`_inFusionsOwnSourceTree` says the git branch-switch policy stays active** in fusion's own
  repository. That policy was deleted outright on 260809.

Setup seeds this file once and never touches it again, correctly — it must not overwrite a
filled-in config. The consequence is that the explanatory text ages while the mechanism moves, and
the file that explains the guard is the one file no agent may correct.

## Two: inheritance is advertised as a feature and is the delivery mechanism for the damage

The template says, in its own `_inherits` note: *"A path added to that default later protects this
project too, without this file being touched."* Read as intended that is a convenience. Read
against what happened it is the exact sentence describing how `rules/**` came to guard a
consumer's engineering documentation for 143 days without anyone choosing it.

Nothing notifies a consuming project when the plugin's default list changes. There is no version
stamp in the config, no diff surfaced at Setup, no advisory naming what was inherited. A project
that reviewed and accepted the list a year ago is governed today by a list it never saw.

## What a fix has to answer, and none of it is obvious

- Should Setup **report** the effective protected-path list at every run, so inheritance is visible
  rather than silent? Cheap, and it puts the fact where somebody looks.
- Should the seeded file carry the plugin **version** it was seeded from, so drift is detectable?
- Should the explanatory `_`-notes live in the file at all, given they cannot be updated once
  seeded? A one-line pointer to `docs/` would not go stale.
- Should the shipped default list be **narrower**, with `rules/**` and `agents/**` recognised as
  patterns that mean something entirely different outside the plugin's own repository?

The last one is the substantive question and belongs in a decision record, not here.

---
Resolved: Moot rather than fixed: the mechanism went. `guard.protectedPaths`, the inherited list this record is about, was removed on 2026-08-12 with the protected-path half of the guard, and the remaining guard settings went on 2026-08-16 with the guard-s last verdict (`hooks/lib/config.ts` header). `templates/` now holds one file, `fusion.json`, whose only live leaf is `orchestrator.maxTurns`. There is no inherited list left to go stale and no silent delivery left to be told about. What replaced the failure mode is the opposite behaviour: a retired file or key is reported in an advisory on every guarded tool call until the project deletes it (`hooks/lib/config.ts`, `RETIRED_PROJECT_FILES` / `RETIRED_TOP_LEVEL_KEYS`). Closed by reconciliation pass 260817-1836 at HEAD `2552586`.
