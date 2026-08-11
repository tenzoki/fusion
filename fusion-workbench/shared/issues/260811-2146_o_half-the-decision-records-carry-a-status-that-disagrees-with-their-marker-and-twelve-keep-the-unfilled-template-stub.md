# Half the decision records carry a `**Status:**` that disagrees with their marker, and twelve keep the unfilled template stub

---

**Severity:** Medium — 34 of 67 live decision records state a status their own filename contradicts, including two of the three this range transitioned; the class the Circle record just got an owner for, unowned on the larger store
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `rules/fusion-workbench-conventions.md:430-475` (the decision-record template), `fusion-workbench/shared/decisions/**`, `fusion-workbench/circles/*/decisions/**`
**Cross-references:**
`agents/orchestrator.md:254-292` (`## Circle head fields` — the fix `282ef42` gave the *Circle* record for exactly this defect);
`shared/issues/260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md` (the open question of whether the field should exist at all);
`shared/decisions/260807-2131_i_which-language-governs-a-customer-deliverable.md` and `shared/decisions/260811-1534_i_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` (two instances created in this range)

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
| `_i_` | `open` | `260807-2131_i_which-language-governs-a-customer-deliverable.md` |
| `_i_` | `open` | `260811-1534_i_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` |
| `_i_` | `open` | `260806-0015_i_zitierform-fuer-workbench-records.md` |
| `_i_` | `answered` | `260810-0920_i_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md` |
| `_a_` | `open` | `260810-2145_a_should-a-repeated-skill-body-snippet-become-a-bin-helper….md` |
| `_d_` | `open` | `260810-0710_d_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` |

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

Twelve non-open records keep it verbatim and append the real annotation *below* it as a new block, so the record states both. `260811-1534_i_…:127-143`:

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
2. **`260802-0920` is open on whether the Status field should exist at all**, and `agents/orchestrator.md:288` explicitly says the disagreeing records are the evidence that question will be decided against. At 51 % the evidence is now overwhelming, and it is worth putting the number in front of the person who will decide.
3. **The unfilled stub is not a stale value, it is a false statement** placed above the true one, in the same file. That has no "the marker wins" defence — the marker says nothing about which of two `Answered:` lines to read.

## Fix direction

This is a decision to put to the user, not a repair to start. The two coherent answers:

- **Own it.** Give the decision record's `**Status:**` a writer and a write moment, the way `282ef42` did for the Circle record: whoever renames the marker sets the field in the same command, and the template's stub block is replaced in place rather than appended below. Then a one-time sweep of the 34, and a lint that reads marker-vs-field over every record under a `decisions/` store.
- **Drop it.** Delete `**Status:**` from the decision template and from the 67 records, on the reasoning that the marker already carries the state and a duplicated field is a second thing to keep in step. That answers `260802-0920` for decisions and leaves the Circle record's field (which has three mechanical readers) untouched.

Do **not** hand-correct the 34 without answering the question first — `agents/orchestrator.md:288` says so for the Circle record and the reason transfers: the disagreements are the measurement.

The stub half is repairable either way and independently: the template should be filled in place, and a lint can assert that no record carries `set when status moves to` beside a filled annotation of the same kind.

## Acceptance criteria

- The user has answered whether the decision record's `**Status:**` field is owned or dropped.
- No live decision record carries an unfilled `<set when status moves to _X_>` line beside a filled `X:` annotation.
- A test measures the chosen invariant over every record under a `decisions/` store and fails with the record's path when it breaks.
