# Defect report to fusion: the citation convention cites the part of a record that moves

**Date:** 2026-08-28
**Subject:** fusion plugin 10.19.0, as installed
**Written by:** orchestrator of consumer project (cocreator), at the user's request, for carrying over to plugin project
**Audience:** whoever maintains fusion. This report is written for a reader outside this project.

---

## The error in one paragraph

fusion's record-keeping moves a record twice in its ordinary life. A state transition renames
it (`_o_` to `_c_`, `_a_` to `_i_`), and the archive step of `/fusion:cleanup` moves it into
another store. fusion's citation convention names a record by a path that contains both the
marker and the store. So **every transition fusion performs invalidates the citations that name
what it moved**, by construction rather than by accident. fusion ships no mechanism that
notices: seventeen `bin/` helpers, none of which reads a citation, and no hook that mentions one.
The result is a corpus that silently decays at a rate set by how well the method is followed —
the more diligently a project transitions its records and archives its closed Circles, the more
of its own references it breaks.

## What we measured, and where

All figures are from this project's corpus at HEAD `4b3d70f6` unless the row says otherwise, and
each is reproducible with `codebase/python/citation_form.py`, a detector this project built for
the repair and which fusion is welcome to take.

| Measure | Value |
|---|---|
| Path citations to workbench records, before the repair | 2483 |
| Of those, no longer resolving | 1151 |
| Dangling because the record's **store** moved (alone or with the marker) | 826 of 1151 |
| Dangling because only the **marker** moved | 268 of 1151 |
| Dangling citations in living code and docs | 31, of which 30 involved a store move |

The last row is the one that matters for the convention. `rules/fusion-workbench-conventions.md`
`## Filename Patterns` already wildcards the marker — `YYMMDD-HHMM_*_<topic>.md` — which repairs
the marker half. It leaves the store segment standing, and the store segment is the half that
did the damage in 30 of 31 living cases.

## Four instances, each verifiable in the shipped plugin

**1. The shipped corpus uses four citation forms where the convention states one.** Classified
over the 45 `.md` files fusion ships under `rules/`, `agents/` and `skills/`:

| Form | Occurrences |
|---|---|
| bare stamp, no slug | 65 |
| storeless basename (`YYMMDD-HHMM_*_topic.md`, the form with no store segment) | 44 |
| store-prefixed path | 42 |
| stamp and slug, no extension | 5 |

A convention with one stated form and four used forms is not being followed by its own author,
and the storeless basename — the most common of the four after the bare stamp — is the form this
project has now adopted, arrived at independently.

**2. The prompts locate fusion's own Grounding in the consuming project's stores.** Shipped agent
prompts cite records as being "in `$SCAN_DECISIONS`" or "under `$SCAN_ISSUES`". Those keys resolve
through `bin/fusion-paths` to the **consuming project's** stores. Checked in this project:
`260827-1120_*_how-often-does-the-review-pass-run.md`, `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md`, `260827-1330_*_does-the-session-ask-for-its-directive-first-and-wait-silently.md`, `260822-1635_*_may-the-orchestrator-have-a-directive-captured-and-by-which-route.md` and `260815-2109` are each cited that
way and each returns zero matches here. They exist in fusion's own workbench, which the plugin
does not ship — the installed tree holds `agents`, `bin`, `docs`, `hooks`, `rules`, `skills`,
`stilwerk`, `templates` and no workbench at all.

This is the sharpest form of the error, because it is not decay. It has never resolved in any
consuming project, on any version, and an agent instructed to read one of those records to settle
a question finds nothing and proceeds without the Grounding it was told to load.

**3. The uniqueness claim behind the convention is scoped more narrowly than it reads.**
`## Filename Patterns` states that no two records share a full basename once the marker is
normalised, measured over 876 records on 2026-08-24. In this project the claim holds for the
underscore name form — 1321 records, 1321 distinct (stamp, slug) pairs — and **fails once pre-v4
bracket names are included**: 2021 records over 2019 pairs, two pairs claimed twice. Both
collisions are in frozen archive runs. Whether fusion's own measurement included its archive
decides whether the claim needs restating or only qualifying.

**4. A citation written to the shipped rule fails a gate built to the rule's own intent.** This
project now runs `make lint-citation-form` in its `check` chain. fusion's own example citation,
placed in a scan root, exits 1. Nothing reddens today because the plugin's files lie outside every
scan root — but an agent following the shipped rule while writing into this project's workbench
produces a violation.

## What this cost, so the size is not guessed

Repairing it here took one session: a detector, a census, a user gate, four sweeps and a gate
wired into `make check`. 4928 citations rewritten across 1919 files, in 21 commits. Three
further defects were found *after* the gate was first reported green, each because a census
produced by a matcher cannot measure that matcher's blind spot — 112 citations broken across a
line end, 813 whose basename does not end in `.md`, and an unmeasured population carrying no
store segment. Those are filed here as `260828-0117_*`, `260828-0130_*` and `260828-0012_*`.

## What fusion would have to decide, not what it should do

This project changed its own convention on its own corpus. Whether the shipped rule should follow
is fusion's decision on fusion's evidence, and this report deliberately proposes no wording. Four
things would have to be checked first, none of which is measurable from a consuming project:

1. Whether `(stamp, slug)` is unique across fusion's own corpus, archive and legacy names included.
   The whole storeless form rests on it, and it is a property of a corpus rather than of a rule.
2. Whether the citations in the shipped prompts are meant to be followed by a consuming agent at
   all. If they are provenance for fusion's maintainers rather than pointers for an agent, they
   should say so and stop naming a consuming project's resolver keys.
3. Whether the marker-wildcard rule is worth keeping once the store is elided, or whether the two
   halves collapse into one form.
4. What detects a broken citation. A convention that cannot be checked decays at the rate the
   method is used, which is the mechanism this report describes.

## Related records in the consumer project (cocreator), not in this workbench

The names below are records of the consumer project that wrote this report. They resolve nowhere in fusion's own workbench; they are quoted verbatim as identifiers, not as pointers.

```
- `260828-0059_*_the-shipped-fusion-citation-rule-keeps-the-store-segment-this-projects-measurement-identifies-as-the-part-that-moves.md` — the narrow divergence, filed first
- `260828-0012_*`, `260828-0117_*`, `260828-0130_*` — the three detector blind spots
- `260810-2146_*_bare-stamp-issue-citations-are-ambiguous-where-the-store-holds-stamp-collisions.md`
- `260826-1103_*_every-marker-move-dangles-the-citations-that-name-the-record-and-the-projects-own-mitigation-covers-one-record-class.md`
- `260827-1749_*_what-citation-form-survives-an-archive-move-so-a-terminal-circle-can-leave-the-live-tree.md` — the decision this project took, with its measurement
```

---
Reconciled 260828-0907 (session 260828-0846-orchestrator-session.md, HEAD ffc6ae88): taken in, not closed. The `_o_` marker and the fenced consumer-record list (lines 112-118) landed in `19b58eef`; the measurement against this corpus is `260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (`ffc6ae88`); its confirmed instances are issues `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md` and `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`, its open questions the five decisions `260828-0904_*`. Closes when those are answered and the two issues are fixed.

Resolved: f1099c5f — the five decisions `260828-0904_*_does-the-mandated-citation-form-include-the-store-segment.md`, `260828-0904_*_is-an-archived-record-a-citation-target.md`, `260828-0904_*_should-the-uniqueness-claim-state-its-scope.md`, `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md` and `260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md` are implemented in that commit (storeless form, gate, uniqueness test, `bin/fusion-citation-check`, `$SCAN_*` lint); the two fixes `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md` and `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md` land in the same commit. Circle `260828-2342-citation-form-drops-store-segment`.
