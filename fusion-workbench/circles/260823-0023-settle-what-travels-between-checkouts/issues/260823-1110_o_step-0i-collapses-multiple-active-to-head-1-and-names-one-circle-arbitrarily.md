Step 0i collapses `MULTIPLE-ACTIVE` to `head -1` and names one Circle arbitrarily

---

**Severity:** Medium. The step's whole purpose is to tell a checkout what it pulled, and in this case it tells it about one of several and is silent about the rest.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `skills/setup/SKILL.md:346-352`
**Cross-references:** plan step 5 in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`; `agents/playmaker.md`, which defines `MULTIPLE-ACTIVE` beside `MISSING-POINTER`; `skills/next/SKILL.md:120` renders both

---

## What is wrong

Step 0i detects the condition with one line:

```bash
[ -f ./fusion-workbench/.active-circle ] || find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_t_circle.md' 2>/dev/null | head -1
```

The branch table beneath it reads "A path printed — the directory name is its second-to-last segment", which presumes exactly one. `head -1` takes whichever record `find` reaches first, in filesystem order, and discards the rest without a word.

Two or more `_t_` records is not a hypothetical: it is a named condition in this project's own vocabulary, `MULTIPLE-ACTIVE`, and `/fusion:next` already reports it. It is also more likely under exactly the arrangement C2 builds, where two people can activate two Circles in two checkouts and both records travel.

What the user then sees is a gate offering to activate one Circle, chosen arbitrarily, with no statement that others are active in the project. Answering yes writes a pointer that silently picks a winner.

## Why this is a case-split fault rather than a rough edge

The step's four-outcome table is presented as covering the value space, and it does not. "A path printed" is two cases wearing one name: exactly one active record, and more than one. They route to different correct behaviour, so a split that merges them cannot be right for both.

## Verified

Read at HEAD `2f1e3a6`. The `find` form itself is correct: `-name '_t_circle.md'` is the form `rules/fusion-workbench-conventions.md` `## Marker globs` sanctions for `find`, and `-mindepth 2 -maxdepth 2` matches the container layout. The defect is `head -1` and the branch table above it, not the search.

## A smaller adjacent gap, stated and not separately filed

The first branch reads "Nothing printed — pointer present, or no active record." A pointer that is present but empty, or that names a directory which does not exist, also prints nothing here and is reported as "pointer present". Step 2 then meets it as `bin/fusion-paths` exit 3. That is pre-existing behaviour and this step does not make it worse, but the branch label states more than the test establishes.

## Direction, not a prescription

Drop `head -1`, count the matches, and split the printed branch in two: one record takes the offer as written; more than one names every Circle found, says `MULTIPLE-ACTIVE` in the vocabulary the project already has, and either declines to offer or offers a choice among them. Which of those two is right is a judgement for whoever takes this, and the answer belongs in the branch table rather than in the shell.
