# Circle-marker glob `circles/*/[t]-circle.md` matches nothing — Circle count silently reports zero

**Filed:** 260716-1956
**Severity:** High
**Domain:** code
**Filed by:** coderev
**Scope:** `rules/fusion-workbench-conventions.md`, `skills/setup/SKILL.md`

## Problem

The new Circle-container layout names the record `[t]-circle.md` — a filename whose
first three characters are a shell bracket expression. Both documents then tell the
agent to find it with an unescaped glob. In POSIX shell `[t]` matches the single
character `t`, so `circles/*/[t]-circle.md` looks for `circles/*/t-circle.md`, which
never exists. The glob matches the empty set.

`rules/fusion-workbench-conventions.md` (commit `6d4a88d`), `## State Markers — circles`:

> State stays cheap to read as a glob: `circles/*/[t]-circle.md` costs what
> `circles/*[t]*.md` used to.

`skills/setup/SKILL.md` (commit `138cd46`), Step 3:

> a Circle is `<stamp>-<slug>/[a]-circle.md`, so the glob is `*/[a]-circle.md` and
> `*/[t]-circle.md`

## Evidence

```
$ mkdir -p circles/260716-1847-umbau && touch 'circles/260716-1847-umbau/[t]-circle.md'
$ for f in circles/*/[t]-circle.md; do echo "MATCH: $f"; done
zsh: no matches found: circles/*/[t]-circle.md      # bash: no output at all
$ for f in circles/*/\[t\]-circle.md; do echo "MATCH: $f"; done
MATCH: circles/260716-1847-umbau/[t]-circle.md
```

## Impact

The failure is silent, which is what makes it worth a High. Under `bash` an unmatched
glob expands to the literal pattern, the customary `[ -e "$f" ] || continue` guard drops
it, and the count comes back `0`. Setup's Circle-count snapshot will report "no Circles"
on a workbench full of Circles, and the `/fusion:next` hint will never print. Nothing
errors; the portfolio surface just goes quiet. `HYG-NO-SILENT-FAIL`.

The regression is specific to the new layout. The old `circles/*[t]*.md` was *loose*
(`*[t]*` matched any name containing the letter `t`, so `...[a]-workbench-umbau.md`
matched too) — a superset, and wrong in the other direction. The container form turns
that same latent bracket bug into an empty set.

## Recommendation

Escape the brackets in both documents, and prefer a form that cannot be re-broken by a
copy-paste:

- `circles/*/\[t\]-circle.md`, or
- `find circles -name '[t]-circle.md'` (`find` takes the pattern as a literal argument;
  no shell expansion), or
- rename the record so no marker character is a glob metacharacter — but that reopens
  the binding decision `260716-1910[a]-circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`,
  so treat it as a last resort.

Whichever form is chosen, it should land in **P-8's lint gate** as a forbidden-pattern
check: an unescaped `[a]`/`[t]`/`[c]`/`[b]`/`[s]`/`[d]` inside a glob is a defect class
that will recur across the 26 prompt conversions in Turn 2, where every agent that counts
Circles will copy whatever the conventions document shows.

## Cross-references

- `rules/fusion-workbench-conventions.md` `## State Markers — circles`
- `skills/setup/SKILL.md` Step 3 (Circle-count snapshot and hint)
- Governing plan: `fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md` (P-8 lint gate)

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
