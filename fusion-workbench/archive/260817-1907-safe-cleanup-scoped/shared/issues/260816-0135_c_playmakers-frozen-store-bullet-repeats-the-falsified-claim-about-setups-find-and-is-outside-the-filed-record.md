Playmaker's frozen-store bullet repeats the falsified claim about setup's find, and the filed record does not reach it

---
`agents/playmaker.md:61` ends with *"(`/fusion:setup` Step 0 and Step 3 of cleanup's activity-log step carry the same exclusions in their `find` invocations, for the same reason.)"* Setup's `find` carries no `-not -path` flags at `3a0408a` — `c0e179a` replaced the exclusion list with a tree bound. This is the same falsification already filed as `260816-0058`, at a second site. That record names `rules/fusion-workbench-conventions.md:64` and its sibling `260816-0025_*_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md`, and neither reaches an agent prompt, so this site would be left standing when the other two are corrected.

---

## Verified at `3a0408a`

Corpus grep for cross-references to setup's exclusions returns exactly two sites:

```
agents/playmaker.md:61                    "(/fusion:setup Step 0 and Step 3 of cleanup's activity-log step carry the same exclusions in their find invocations…)"
rules/fusion-workbench-conventions.md:64  "Four consumers exclude stashes/ — skills/setup/SKILL.md:67, …"
```

And the line the first one describes:

```
skills/setup/SKILL.md:67   BM="$({ [ -d "$WB/shared" ] && find "$WB/shared" … ; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 … ; } | grep -E …)"
```

No `-not -path` anywhere on that line. The activity-log half of the sentence is still true — `skills/log-activity/SKILL.md:82` carries `-not -path '*/archive/*' -not -path '*/stashes/*' -not -path '*/stilwerk/*' -not -path '*/.migration-v2-backup/*'`.

## Why it is a third record rather than a note on `260816-0058`

`260816-0058` closes with **Route:** *"normative text over shipped behaviour — `curator`, or an `ontocoder`/`coder` pass that owns `rules/`."* An agent prompt is a `coder` file and is outside `rules/`, so a pass scoped by that record's own route does not open `agents/playmaker.md`. The record also enumerates its related work explicitly (`260816-0025_*_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md`) and this site is not in it — it was written before `c0e179a` landed and could not have been.

Note the sentence was itself edited this session, by `642130f`, which rewrote its first half (`/fusion:archive` → "the target of cleanup's archive step") and left the parenthetical. At that moment the parenthetical was still true; `c0e179a` falsified it three commits later.

## Fix direction

The correction is the one `260816-0058` insists on for its own site, and the reason is the same: say that Setup **stopped needing** the exclusion, not that it lost one. Suggested:

> (Step 3 of cleanup's activity-log step carries the same exclusions in its `find`; `/fusion:setup` Step 0 reaches the same result by bounding its probe to the two trees `/fusion:migrate` converts, so the frozen stores are outside it by construction rather than by exception.)

Resolve it in the same pass as `260816-0058` and `260816-0025_*_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md` — three sites, one measurement, and the measurement is already written down in `260816-0058`.

**Found by:** coderev, reviewing `f4f01b0..3a0408a`.

---
Resolved: `agents/playmaker.md:61`'s parenthetical now reads *"(Step 3 of cleanup's activity-log step carries the same exclusions in its `find`; `/fusion:setup` Step 0 bounds its probe to the two live trees instead, so the frozen stores fall outside it by construction rather than by exception.)"* — the wording this record proposed, corrected in the same pass as `260816-0058` so both sites agree.
