# The work queue carries 81 literal-marker citations and three of them are already dead

---

**Severity:** Medium — the queue is the document a session reads to decide what to do next, and no gate reads its citations; three are dead today and one of the three points at the record that ratified the form it violates
**Domain:** code
**Filed by:** reconciler (final reconciliation of session `260811-0752`)
**Affects:** `fusion-workbench/tasklist.md`, `agents/taskplanner.md` (the producer), `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the gate that does not reach it)
**Cross-references:**
`circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md` (the ratified wildcard form);
`shared/issues/260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` (the same class in shipped sources);
`shared/issues/260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md` (the same class in Circle records)

---

## What is wrong

Decision `260806-0015_*_zitierform-fuer-workbench-records` ratified the wildcard citation form
`YYMMDD-HHMM_*_<slug>` precisely so a citation survives a marker transition. `tasklist.md` was
rebuilt at `f70cb07` (2026-08-11 17:34) and cites records the other way round:

```
literal-marker citations: 81
wildcard-form citations:   7
```

Measured at HEAD `31746d1` over every backticked path of the shape
`(shared|circles/<dir>)/(issues|decisions|planning)/YYMMDD-HHMM_<letter>_<slug>.md` in the file.

**Three of the 81 are already dead**, 18 commits after the rebuild:

| Cited as | On disk now |
|---|---|
| `circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_o_integritaet-des-eskalationsspeichers.md` | `…/260807-0945_a_…` |
| `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` | `…/260810-0710_d_…` |
| `shared/decisions/260806-0015_i_zitierform-fuer-workbench-records.md` (task 1's governing rule) | **no such file** — the record lives in `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/` and never lived in `shared/` |

None of the 7 wildcard citations is dead.

The third row is the sharpest: the queue's very first task cites, by a literal marker **and** a
wrong store, the decision record that ratified the wildcard form. A reader following that path
finds nothing.

## Why nothing caught it

`hooks/lib/__tests__/reference-resolution-lint.test.ts` builds its surface from `rules/`,
`agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the root `README*.md` and `CLAUDE.md`,
`bin/` shebang scripts, `install.sh`, and comment lines in `hooks/lib/*.ts` (`surface()`,
lines 118-155). **It never reads anything under `fusion-workbench/`.** `260811-2105` established
that the workbench side is unguarded and named Circle records; nobody has named the queue, which
is the workbench file most likely to be read by a machine and acted on.

The producer does not require the form either: `agents/taskplanner.md` mandates the
`**Active Circle:**` head field but says nothing about how a `**Source:**` cites a record.

## Why it matters more than a broken link

A queue entry's `**Source:**` is what an executor opens to learn what it is fixing. A dead path
does not fail loudly — the executor reads the *title* out of the queue entry instead and works
from that, which is how a fix lands against a summary rather than against the record. And the
marker transitions this class breaks on are exactly the ones a cleanup session produces in bulk:
this session moved 24 records `_o_`→`_c_` and 9 decisions out of `_o_`, and the queue was rebuilt
in the middle of it.

## Fix direction

Two pieces, and the first is worth little without the second.

1. **The producer writes the wildcard form.** `agents/taskplanner.md` Step 4 states the citation
   form for `**Source:**`, `**Closes:**` and any record path in an entry body, citing
   `260806-0015_*_zitierform-fuer-workbench-records`. One sentence.
2. **A gate reads the workbench.** Extend the reference-resolution lint's surface, or add a
   sibling that reads `fusion-workbench/tasklist.md` and `portfolio.md` — the two generated,
   machine-read documents at the workbench root — and fails on a literal marker in a record
   citation. Records themselves are a larger population and are `260811-2105`'s question; do not
   fold them in here without answering that record first.

Whether the existing lint grows a workbench surface or a second lint is written is the open part.
The existing one is pinned to `pluginRoot` throughout and a consuming project's workbench is not
under it, so this is not a one-line widening.

## Acceptance criteria

- No literal-marker record citation in `fusion-workbench/tasklist.md`.
- `agents/taskplanner.md` states the citation form, and a test asserts that it does (the same
  shape as `queue-ground-producer.test.ts` for the `**Active Circle:**` field).
- A gate fails when a queue citation resolves to nothing, and its non-vacuity is measured against
  the three dead citations recorded above.
