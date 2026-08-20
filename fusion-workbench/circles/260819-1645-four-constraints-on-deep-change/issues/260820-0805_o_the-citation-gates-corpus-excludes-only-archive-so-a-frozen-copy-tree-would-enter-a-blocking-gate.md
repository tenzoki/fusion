# The citation gate's corpus excludes only `archive/`, so a frozen copy tree would enter a blocking gate

---

`hooks/lib/__tests__/workbench-citation-lint.test.ts` builds its corpus by walking every `.md` under
the workbench root, dropping anything under `archive/`, and keeping what four patterns match. Two of
those four are unanchored:

```
const OPEN_ISSUE_RE    = /(?:^|\/)issues\/[0-9]{6}-[0-9]{4}_o_[^/]+\.md$/;
const LIVE_DECISION_RE = /(?:^|\/)decisions\/[0-9]{6}-[0-9]{4}_[oa]_[^/]+\.md$/;
```

`(?:^|\/)` matches at any path segment, which is what lets one pattern serve both a Circle's store
and `shared/`. It also matches inside any other directory that happens to hold an `issues/` or
`decisions/` subtree — and the workbench layout has more than one kind of frozen copy tree. The
archive skill's own never-archive reasoning and the activity-log skill both name four:
`skills/log-activity/SKILL.md:89` excludes `archive/`, `stashes/`, `stilwerk/` and
`.migration-v2-backup/` from its scan, on the ground that they "hold moved, frozen, or configured
content rather than activity". The gate excludes the first and no other.

None of the three exists in this repository today, so nothing is red and nothing is wrong in the
tree. `/fusion:migrate` creates `.migration-v2-backup/` in a project it converts, and this
repository is a project like any other.

The consequence is not a false green but a false red that cannot be honestly cleared: a frozen copy
carries the citations that were correct when it was frozen, and repairing them falsifies the backup.
The gate's own corpus comment already reasons this way about `archive/` — "repairing its citations
would rewrite history rather than correct it" — and that reason applies verbatim to the other three.

---

**Severity:** Medium — latent, with a concrete trigger (`/fusion:migrate` in this repository) and a
failure mode the gate has no honest remedy for.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:81-100` (the four predicates and
the single `ARCHIVE_PREFIX` exclusion)
**Cross-references:** `skills/log-activity/SKILL.md:89` (the four-directory exclusion and its
reason); `shared/issues/260816-0025_*_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md`
(the same directory, missing from a different mechanism's list — evidence that the omission is a
class rather than an accident)

**Verified 2026-08-20 at HEAD `bbfc912`.** The workbench root holds `archive/`, `circles/`,
`shared/`, `stilwerk/`, `monitor/` and the machine-written files; no `stashes/` and no
`.migration-v2-backup/` exist. `find fusion-workbench -type d \( -name issues -o -name decisions \)`
returns nothing outside `circles/`, `shared/` and `archive/`.

## Fix direction

Turn `ARCHIVE_PREFIX` into the same four-directory exclusion the activity-log skill states, and cite
that skill's line as the shared reason rather than restating it. Anchoring the two patterns instead
would be the narrower change but the wrong one: the anchors would have to enumerate `shared/` and
`circles/<dir>/`, which is a second copy of the layout, and the layout has exactly one authoring
home.
