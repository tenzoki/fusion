# Half the decision records carry a `**Status:**` that disagrees with their marker, and twelve keep the unfilled template stub

---

**Severity:** Medium — 34 of 67 live decision records state a status their own filename contradicts, including two of the three this range transitioned; the class the Circle record just got an owner for, unowned on the larger store
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `rules/fusion-workbench-conventions.md:430-475` (the decision-record template), `fusion-workbench/shared/decisions/**`, `fusion-workbench/circles/*/decisions/**`
**Cross-references:**
`agents/orchestrator.md:254-292` (`## Circle head fields` — the fix `282ef42` gave the *Circle* record for exactly this defect);
`260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md` (the open question of whether the field should exist at all);
`260807-2131_*_which-language-governs-a-customer-deliverable.md` and `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` (two instances created in this range)

---

## What is wrong

`282ef42` closed the Circle-record version of this defect: a record whose filename said `_t_` while its head said `anticipated`. It gave the three head fields an owner and a write moment. The same defect is live on **decision** records at a much larger scale, and nothing in this range touched it.

**Measured over every live decision record** (67 records under `shared/decisions/` and `circles/*/decisions/`, archive excluded), comparing the filename marker against the `**Status:**` head field, using the template's own vocabulary (`_o_`→open, `_a_`→answered, `_i_`→implemented, `_d_`→deferred, `_s_`→superseded):

```
total=67  mismatched=34  non-open-records-still-carrying-the-unfilled-stub=12
```

**34 of 67 — 51 %.** A representative slice:

| Marker | `**Status:**` says | Record |
|---|---|---|
| `_i_` | `open` | `260807-2131_*_which-language-governs-a-customer-deliverable.md` |
| `_i_` | `open` | `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` |
| `_i_` | `open` | `260806-0015_*_zitierform-fuer-workbench-records.md` |
| `_i_` | `answered` | `260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md` |
| `_a_` | `open` | `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper….md` |
| `_d_` | `open` | `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` |

The first two were transitioned `_a_`→`_i_` **inside this range**, in `9f84254`. The third is the decision that `b53c7dd`'s new citation-form lint enforces.

## The second half: the template stub is left standing beside its own answer

`rules/fusion-workbench-conventions.md:468-475` prescribes a four-line block that the writer is meant to **fill**:

```
---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
```

Twelve non-open records keep it verbatim and append the real annotation *below* it as a new block, so the record states both. `260811-1534_*_…:127-143`:

```
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
…
---
Answered: user, session 260811-0752 (chat) — **Option 1, archive rather than truncate.** …
---
Implemented: `skills/archive/SKILL.md` (safety filter 1 narrowed, …
```

A `grep '^Answered:'` over that file returns "not yet answered" first and the answer second. Any reader — human or a future scanner — that takes the first match takes the placeholder.

## Why the marker being authoritative does not settle it

`rules/circle-records.md` and `agents/orchestrator.md:286` both say the filename wins where the two disagree, and that is right. But three things follow that a "the marker is the truth" shrug does not cover:

1. **The head is what a reader meets first**, and it is what `agents/orchestrator.md:270` names as the reason the Circle version was worth fixing.
2. **`260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md` is open on whether the Status field should exist at all**, and `agents/orchestrator.md:288` explicitly says the disagreeing records are the evidence that question will be decided against. At 51 % the evidence is now overwhelming, and it is worth putting the number in front of the person who will decide.
3. **The unfilled stub is not a stale value, it is a false statement** placed above the true one, in the same file. That has no "the marker wins" defence — the marker says nothing about which of two `Answered:` lines to read.

## Fix direction

This is a decision to put to the user, not a repair to start. The two coherent answers:

- **Own it.** Give the decision record's `**Status:**` a writer and a write moment, the way `282ef42` did for the Circle record: whoever renames the marker sets the field in the same command, and the template's stub block is replaced in place rather than appended below. Then a one-time sweep of the 34, and a lint that reads marker-vs-field over every record under a `decisions/` store.
- **Drop it.** Delete `**Status:**` from the decision template and from the 67 records, on the reasoning that the marker already carries the state and a duplicated field is a second thing to keep in step. That answers `260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md` for decisions and leaves the Circle record's field (which has three mechanical readers) untouched.

Do **not** hand-correct the 34 without answering the question first — `agents/orchestrator.md:288` says so for the Circle record and the reason transfers: the disagreements are the measurement.

The stub half is repairable either way and independently: the template should be filled in place, and a lint can assert that no record carries `set when status moves to` beside a filled annotation of the same kind.

## Acceptance criteria

- The user has answered whether the decision record's `**Status:**` field is owned or dropped.
- No live decision record carries an unfilled `<set when status moves to _X_>` line beside a filled `X:` annotation.
- A test measures the chosen invariant over every record under a `decisions/` store and fails with the record's path when it breaks.

---

## Reconciliation 260811-2330 — measurement reproduced, stub half repaired, the question left open

**The record stays open.** Its first half is a question for the user and this pass did not touch
it. Its second half was repairable without an answer, and is now repaired.

### The 34 reproduce exactly, and 5 of them are not what the number suggests

Re-measured at HEAD `31746d1` over the same population — 67 live decision records under
`shared/decisions/` and `circles/*/decisions/`, archive excluded. No decision record was touched
after the review commit `e3da397`, so nothing has moved:

```
total=67  mismatched=34  non-open-records-with-an-unfilled-stub=12
```

The 34 is right for the check as the record ran it, comparing the `**Status:**` field against the
marker's vocabulary word by **exact equality**. Under a looser reading — the correct word appears
anywhere in the field — the count is **29**. The 5 in between are records whose field is already
correct and carries a trailing parenthetical about a past correction:

| Record | `**Status:**` |
|---|---|
| `260718-2150_*_reviewers-history-log-step.md` | `_i_ (implemented — reviewer edits realising the ruling landed in Circle D…)` |
| `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` | `implemented (corrected from `answered` by reconciliation 260804-1021-reconciliation.md…)` |
| `260803-1803_*_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set…md` | `implemented (corrected from `open`…)` |
| `260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md` | `implemented (corrected from `open`…)` |
| `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` | `implemented (marker `_i_`; header corrected by the reconciler 260809-2252…)` |

**The substantive disagreement is 29 of 67, not 34 of 67.** This matters for the acceptance
criterion, not for the decision: a lint written to the exact-equality reading fails these five,
and each of them is a record a previous reconciliation pass deliberately annotated. Whichever way
the ownership question is answered, the check that enforces it has to accept a field that states
the right state and then explains itself, or the sweep it demands will delete five provenance
notes.

**The 29 were not hand-corrected**, per this record's own instruction and
`agents/orchestrator.md:288`: the disagreements are the measurement for `260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`.

### The stub half is done — acceptance criterion 2 is met

Thirteen unfilled placeholder lines stood above a filled annotation of the same kind, across
9 records. All 13 are gone, along with the wholly-unfilled blocks that carried most of them —
32 placeholder lines removed in total:

| Record | Removed |
|---|---|
| `260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md` | whole block (4) |
| `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` | 3 lines |
| `260806-0015_*_veraltete-regeln-im-eigenen-repo-melden-oder-umgehen.md` | whole block (4) |
| `260806-0015_*_wem-gehoert-die-circle-aktivierung.md` | whole block (4) |
| `260806-0015_*_zitierform-fuer-workbench-records.md` | whole block (4) |
| `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` | whole block (4) |
| `260810-0718_*_should-rebuild-map-merge-with-the-existing-map-or-replace-it.md` | whole block (4) |
| `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md` | 1 line |
| `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` | whole block (4) |

No record now carries an unfilled `<set when status moves to _X_>` line beside a filled `X:`
annotation of the same kind. **Three records still carry a placeholder and were left alone on
purpose** — `260807-0158_*_how-is-a-unique-record-filename-obtained.md`,
`260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`
and `260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md`.
Their leftovers are `Deferred:` and `Superseded by:` lines on records that were never deferred or
superseded, so they state nothing false; the criterion is about a placeholder contradicted by an
answer beside it, and these are not contradicted.

**The same defect had exactly one instance on the issues side**, and it is fixed with them:
`260810-1730_*_die-erzeugung-von-portfolio-md-schreibt-den-zustandsmarker-aus-…md`
carried an empty `Resolved:` at line 112 and the real one at 155.

### What is left for the user

Only the first half: whether the decision record's `**Status:**` field is **owned** (a writer, a
write moment, a one-time sweep of the 29, a lint) or **dropped** (deleted from the template and
the 67). Nothing this pass did constrains that choice.

Reconciled by `reconciler`, `260811-2330-reconciliation.md`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `260817-1836-reconciliation.md`). Re-measured rather than re-asserted. Over the 56 records in `shared/decisions/` at HEAD, 18 carry a `**Status:**` header that disagrees with their filename marker and 5 still carry an unfilled template stub of the form `Implemented: <set when status moves to _i_>`. The stub half is close to repaired and the disagreement half is not: the offenders include `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` and `260807-2131_*_which-language-governs-a-customer-deliverable.md`, both headed `open` while the marker reads implemented. One was corrected in this pass as a side effect of a marker walk (`260814-2017`, header moved to `implemented` with the marker). No decision answers whether the decision record-s own Status field should be owned or dropped; the adjacent record `260815-2312_*_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md` is scoped to the Circle record-s field, which is a different question.


---
Resolved: the field itself was removed, so no record filed from now on can carry a state its marker
contradicts. `260818-2212_*_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`
put the question to the user and was answered option 1 on 2026-08-18; the removal landed in the same
session, taking the `**Status:**` line out of `rules/fusion-workbench-conventions.md`
`## Decision Record Template` and out of the worked example in `rules/decision-record-examples.md`,
with the reason and the measurement stated in the conventions file.

The existing drift is **not** corrected, and that is the answer rather than an omission. A record
written before the removal keeps the field exactly as it stands; hand-correcting one destroys the
evidence the removal was decided on, which is the position the Circle precedent
`260815-2312_*_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md` took and the constraint the user chose this option under. This defect therefore closes
on the cause being gone, not on the population being cleaned.

---
Revised by: `260819-0836_*_the-status-field-closure-answers-one-of-the-defects-two-halves-and-the-templates-footer-stub-stands.md` — the `Resolved:` note above answers the first of this record's two halves and does not mention the second. The `**Status:**` head field is gone, so the marker-versus-header drift cannot recur. The unfilled footer stub this record's own `## The second half` section is about is untouched: `rules/fusion-workbench-conventions.md` `## Decision Record Template` still prescribes the placeholder block, now five lines rather than four, and three live decision records still carry it verbatim at HEAD `83488e9` — including `260818-2212_i_*`, the record that authorised the closure.

The marker stays `_c_`: the removal that the note describes did land, and the second half is now carried by its own record rather than by this one.
