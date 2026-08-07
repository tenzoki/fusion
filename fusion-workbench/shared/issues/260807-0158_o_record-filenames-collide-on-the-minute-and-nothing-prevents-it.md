Record filenames collide on the minute, and the convention has no mechanism that prevents it

---

**Severity:** Medium (no data loss; loss of citability)
**Domain:** knowledge (the convention) with a code half (a helper, if the answer is a helper)
**Filed by:** consultant, from a report by the consuming project `unite-co-creator`, session 260806-1242
**Affects:** `rules/fusion-workbench-conventions.md` `## Filename Patterns` (lines 185-208) and `## Timestamps` (lines 172-174); every agent prompt and skill body that mints a record filename
**Cross-references:** decision `fusion-workbench/shared/decisions/260807-0158_o_how-is-a-unique-record-filename-obtained.md` (the three-option fork this defect opens)

---

## The defect

The filename pattern for specs, plans, defects, decisions, histories, reviews, analyses,
investigations and consultations is `YYMMDD-HHMM_S_<topic>.md` or `YYMMDD-HHMM-<topic>.md`
(`rules/fusion-workbench-conventions.md:189-204`). Uniqueness of the `YYMMDD-HHMM`
identifier rests on an assumption the document never states: that no two records are
created in the same minute.

Nothing in the conventions addresses the case where they are. `## Timestamps` (line 174)
says only "always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`". No agent prompt, no
skill body and no rule file carries a check-before-write instruction. Verified by grep
across `agents/*.md`, `skills/*/SKILL.md` and `rules/*.md`: the only collision handling
that exists anywhere is in `/fusion:archive`, `/fusion:migrate` and `/fusion:circle-pop`,
and all three handle *destination* collisions during a move, not identifier collisions at
mint time.

Nothing is overwritten. The topic slug differs, so the files coexist. What is lost is the
ability to cite a record by its identifier.

## Measured in fusion's own workbench

The report came from a consuming project. It reproduces here, and more severely.

| Measure | Count |
|---|---|
| Record files in `circles/` plus `shared/` | 556 |
| Distinct `YYMMDD-HHMM` identifiers shared by two or more files | 75 |
| Files carrying a shared identifier | 238 (43 percent of the corpus) |
| Worst single identifier | `260805-1842` — 15 files |

The next three worst are `260805-1840` (15), `260805-1839` (14) and `260805-1841` (12).

The state marker does not disambiguate. All 15 files at `260805-1842` are closed defects,
so they share the identifier *and* the marker: `260805-1842_c_` names 15 files, and only
the slug tells them apart. Same for `260805-1840_c_` (13), `260805-1841_c_` (12) and
`260805-1839_c_` (12).

## Two causes, and the bigger one has nothing to do with concurrency

1. **Batch filing by one agent.** Dominant. The four worst identifiers above are one
   reviewer filing a dozen findings in a single pass, minting a timestamp per file inside
   the same minute. No parallelism involved.
2. **Concurrent agents.** The orchestrator dispatching `coderev` and `ontorev` over the
   same diff; both reach their filing step together.

A fix scoped to cause 2 leaves the larger half untouched.

## What this costs, stated honestly

Bare-identifier citation is real practice in this repository:

- `rules/protected-path-discipline.md:137` cites `issues/260804-0838…`
- `rules/protected-path-internals.md:133` cites `issues/260804-1332…`
- `fusion-workbench/shared/issues/260805-1134_o_clear-halt-…md:45-48` cites three sibling
  defects as `260804-1607`, `260804-1601` and `260802-2334`, with no slug

Checked: each of those five stamps still resolves to exactly one file in this workbench,
so no live citation in this repository is currently broken. The practice is established
and the exposure is measured at 43 percent of the corpus; the damage has not yet landed
here. The reporting project states its own citations are already ambiguous, which this
consultation cannot verify from here.

The habit is also visible in `CLAUDE.md`, which cites decisions as
`260806-0015_*_veraltete-regeln-im-eigenen-repo-melden-oder-umgehen.md` — marker
wildcarded, slug retained. That form survives collision. The bare-stamp form does not, and
four files share `260806-0015`.

## Why an instruction will not close it

The obvious patch is prose: "before filing, check whether a file with your chosen prefix
exists, and bump by a minute if so." It fails three ways. It is an obligation, so it
carries a miss rate. A bumped minute records a time that is not the time. And two agents
can still lose the check-then-write race.

fusion has already answered this shape once. `bin/fusion-commit-lock` defends the
cross-agent staging race with an atomic `mkdir` (`bin/fusion-commit-lock:14-15,179`),
chosen over an instruction for exactly these reasons.

## Not retroactively fixable

Renaming the 238 affected files would break every citation that points at them. Whatever
mechanism is chosen going forward, the conventions should also state the fallback that
works on the existing corpus today: **cite by full filename whenever an identifier is
known to be shared.** That is a documentation change independent of the fork.

## What is open

Which mechanism mints the filename. Three options with different costs, recorded as a
separate decision (see Cross-references above). This defect closes when the convention
states how a filename is obtained and the mechanism it names exists.

## Reproduction

```
cd fusion-workbench
find circles shared -type f -name '*.md' | sed -E 's|.*/||' \
  | grep -oE '^[0-9]{6}-[0-9]{4}' | sort | uniq -c | sort -rn | head
```

## Note on the report's own provenance

The reporting agent filed this first as a concurrency defect caused by its own parallel
dispatch, and corrected itself after a reconciler swept the whole workbench and surfaced
the batch-filing cause. The correction is what makes the measurement above worth trusting:
the concurrency half alone would have produced pairs, not runs of fifteen.

## Note on this file's own identifier

This defect and its decision record were filed in the same minute and share the identifier
`260807-0158`. Cite either by full filename.
