# Migration converts Circle files to directories but leaves their record fields pointing at the old flat layout

**Filed:** 260716-1958
**Severity:** Medium-High
**Domain:** code
**Filed by:** coderev
**Scope:** `skills/setup/SKILL.md` Step 0c, `rules/fusion-workbench-conventions.md`

## Problem

Step 0c moves every type folder to `shared/` wholesale and converts each `circles/*.md`
into `circles/<dir>/[S]-circle.md`. It never touches the record's *body*. Meanwhile the
Circle record template was redefined in the same Circle:

`rules/fusion-workbench-conventions.md`, before (commit `7f72dfe`):

```
**Active spec/plan:** <path to spec, plan, or "(none yet)">
**Active session history:** <path to orchestrator session history file, or "(none yet)">
```

after (commit `6d4a88d`):

```
**Active spec/plan:** <filename inside this Circle's planning/, or "(none yet)">
**Active session history:** <filename inside this Circle's history/, or "(none yet)">
```

So a pre-v4 record carries a workbench-relative path — `planning/260716-1910[p]-plan-foo.md`
— written under the old semantics. After migration:

- the file it names now lives at `shared/planning/260716-1910[p]-plan-foo.md`;
- the field is now read under the new semantics as "filename inside this Circle's
  `planning/`", i.e. `circles/<dir>/planning/260716-1910[p]-plan-foo.md`.

Both readings resolve to nothing. The value is wrong twice over — as a path, and as a
filename.

## Impact

Every migrated Circle's two most-followed fields become dangling. The consumers are the
ones that matter most at session start: the orchestrator resumes from
`**Active session history:**`, `/fusion:circle-stash` locates the session history file
"best-effort, when the file can be located", and `playmaker` renders the active session
history path into `portfolio.md`. Each of these degrades quietly — a best-effort lookup
that finds nothing does not announce itself.

This is narrower than it first looks: it only bites Circles that were mid-flight or that
recorded a spec/plan, and only in workbenches with pre-v4 Circle files. But those are
precisely the workbenches where the loss hurts, since a `[t]` Circle is by definition
someone's in-flight work.

Note the interaction with the Origin Rule that makes this not merely a find-and-replace:
the plan the field names has been moved to `shared/planning/`, deliberately and correctly
("unknown origin means `shared/`"). So the fix cannot be "rewrite the field to point
inside the Circle" — the file genuinely is not there.

## Recommendation

Options, in rough order of preference:

1. **Rewrite the fields to a workbench-relative path and relax the template.** Change the
   template back to a path (`<workbench-relative path to the spec/plan, or "(none yet)">`)
   and have Step 0c rewrite `planning/X` → `shared/planning/X` and `history/X` →
   `shared/history/X` in each converted record. A path is unambiguous whether the target
   sits in the Circle or in `shared/`, which the container layout does not remove the need
   for — the migration itself produces exactly the split case.
2. **Report rather than rewrite.** Leave the fields alone and have Step 0c list, per
   converted Circle, which fields now dangle and where their targets landed. Cheaper, and
   consistent with Step 0c's existing "skip loudly rather than guess" posture — but it
   leaves the user manual work with no tooling.
3. **Blank the fields to `(none yet)`.** Rejected: destroys information, and a resumed
   session would silently start a new history file.

Whichever is chosen, the template's "filename inside this Circle's planning/" wording
needs a sentence covering the legitimate cross-store case, or the next reader will hit
the same contradiction.

## Cross-references

- `skills/setup/SKILL.md` Step 0c → "Execute"
- `rules/fusion-workbench-conventions.md` `## Circle record template`
- `rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)` corollary 1
- `skills/circle-stash/SKILL.md` (session-history best-effort lookup)

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
