# Which property separates a head-field identifier from a head-field citation?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260831-2121_*_the-head-field-exemption-reads-only-a-bare-stamp-so-a-name-shaped-identifier-in-a-head-field-is-judged.md` (the defect this answers); `260831-2144_*_repair-three-citation-grammar-defects.md` step 3 (the step that takes the answer); `260831-2143_*_does-a-project-declare-its-own-identifier-head-fields.md` (the recurrence this leaves open); `hooks/lib/citation-scan.ts:712-717` (the clause that changes)

---

## Question

`scanCitationTokens()` exempts a head field's value with the reason `head-field` only when
`kind === "stamp-bare"`. So a `**Date:**` field carrying a bare stamp is exempt, while a
`**Bus session:**` field carrying that same stamp plus a name is judged and dangles, although it
names no record and never will:

```
**Date:** 260722-1943                            stamp-bare/exempt(head-field)
**Bus session:** 260722-1943-some-identifier     stamp-name/dangling
```

The reporting project carries 20 such rows and its blocking gate is red over them.

Widening the gate to every head field is refused by the defect record, because
`**Active spec/plan:**` carries a citation two mechanical readers follow. So the question is which
**decidable** property separates an identifier from a pointer when both are head-field values of the
same shape. The answer must be chosen before the fix is written, because the whole of the code change
is one predicate.

## Options

1. **The field label, as an enumeration of identifier-bearing labels.** The exemption fires when the
   value is a bare stamp (today's clause, unchanged) **or** when the label left of the colon is one
   the grammar enumerates. `Bus session` is the first entry; the list grows on measured evidence.
   - Pros: the only option measured to keep `**Active spec/plan:**`, `**Circle:**`, `**Provenance:**`
     and `**Result:**` judged. Fails **strict** — a label fusion has not enumerated produces a false
     dangle, which is visible and repairable. Decidable from an input the mechanism already reads
     (`isHeadFieldValue()` already parses the label to recognise the line).
   - Cons: the list is compiled into fusion, so a consuming project cannot extend it; its own
     identifier field is judged until fusion ships the label — the one-release-behind cost every
     `bin/` helper already carries. Option 1 of the record below removes that.
2. **A head-field value resolves or is exempt, never dangles.** Read the resolution result rather
   than the text.
   - Pros: no list, no maintenance, and it unblocks any project's field on the day it is written.
   - Cons: fails **loose**. A broken `**Active spec/plan:**` goes silent, and so do the 231
     `**Circle:**` lines outside `archive/` in this tree, measured
     (`grep -rhInE '^\*\*[^*]+:\*\*[[:space:]]+`?[0-9]{6}-[0-9]{4}(-[a-z0-9]+)+`?[[:space:]]*$'`).
     It is also the largest change of the three: exemptions run **before** resolution in
     `consider()`, so this option reorders the walk rather than editing a predicate.
3. **In a head field, a token that neither ends in `.md` nor carries a marker slot is not a
   citation.** Derived from the record template, where `**Active spec/plan:**` and
   `**Active session history:**` both hold `.md` basenames.
   - Pros: reads the token alone, no list, no reordering.
   - Cons: **refuted by measurement.** A Circle is cited by bare directory name, and a head field
     holds one routinely: 249 lines outside `archive/` in this tree over eight labels — 231
     `**Circle:**`, 6 `**Provenance:**` (in `rules/*.md`, inside the blocking shipped-surface gate),
     4 `**Result:**`, 4 `**Cross-references:**`, and one each of `**Session:**`, `**Product:**`,
     `**Circle created:**`, `**Activated from Circle:**`. Every one of them would go silent.

## Constraints

- `**Active spec/plan:**` stays judged. The defect record makes this the acceptance line.
- No head field is edited by the fix.
- `**Date:** <stamp>` stays exempt. `citation-sweep.test.ts:70-88` asserts that `**Date:**` and
  `**Started:**` produce no token, so an option that narrows the existing bare-stamp clause to a
  label list breaks a committed case — which is why option 1 is written as a union with that clause
  rather than as a replacement of it.
- Whatever is chosen is named in `hooks/lib/citation-scan.ts`'s header as a property. The defect
  record allows an enumeration provided the record says plainly that one was chosen and why; option 1
  takes that branch.
- The reporting project must be unblocked without configuration: `Bus session` is fusion's own
  retired bus-protocol label (removed v3.15.0), so a shipped list of one entry clears their 20 rows.

## Recommendation

**Option 1.** Three reasons, in descending weight.

Option 3 is refuted rather than costed: the property it proposes does not separate the two classes,
and the 249 measured lines are what says so. That leaves 1 and 2.

Between those, the failure directions are not symmetric. Option 1 fails by reporting something that
is fine; option 2 fails by staying quiet about something that is broken. This project has already
written that asymmetry down, in `hooks/lib/__tests__/workbench-citation-lint.test.ts`: *a citation
gate erring strict costs a repair while erring loose costs a dead pointer nobody sees.* The same
reasoning applies here unchanged.

And option 2 is the largest of the three to build, because it inverts the order of `consider()` —
which is the opposite of what a blocked consuming project needs from this repair.

The cost option 1 carries is real and is not hidden: a project's own identifier field waits for a
fusion release. That recurrence is the subject of the record below, and it is left open on purpose
rather than being built into this repair.

---

## Measurement against the recommendation, 260831-2215 (orchestrator)

**Option 1 is refuted too, on the same kind of evidence that refuted option 3**, and the record is
left `_o_` with no recommendation standing rather than carrying one the measurement kills.

Counting the head-field labels in this tree whose value is stamp-shaped
(`grep -rhoE '^\*\*[A-Za-z /-]+:\*\* *[0-9]{6}-[0-9]{4}[^ ]*' fusion-workbench/ rules/`) gives **26
distinct labels**, not the handful an enumeration implies. The head of the distribution:

```
Circle 76 · Date 53 · Active session history 25 · Active spec/plan 24
Cross-references 23 · Started 14 · Plan 13 · Filed 11 · Resolved 10
Session 9 · Provenance 9 · Stamp 8
```

That alone is a maintenance cost rather than a refutation. This is the refutation: **one label
carries both kinds under the same name.** `**Session:**` appears as `260829-1133-orchestrator-session.md`,
a citation, and as `260827-1838`, a timestamp. A rule keyed on the label cannot separate those two,
because the label is identical and only the value differs — which is where the question started.

So the field name determines the kind no better than the basename does, and the enumeration would be
a list that is expensive to keep and wrong on at least one of its own entries.

**What is left, and it is not proposed here either.** A head-field value that resolves to nothing
could be classified `undecidable` rather than `dangling`. It needs no list, it hides nothing (the
token still appears under `--undecidable`), and it is honest about the situation: inside a head field
the question genuinely cannot be settled from the text, which is what that class means everywhere
else in this grammar. Its cost is real and is the one option 2 was rejected for: a genuinely broken
`**Active spec/plan:**` stops being a violation. Whether that trade is acceptable is the user's, and
it was not put to them, because the session that reached this point had already spent three rounds
on refuted candidates and the two mechanical defects were shipped instead.

The 20 rows in the reporting project stay visible and named. Nothing here is urgent; what is urgent
is that the next person to open this record does not act on a recommendation that measurement has
already removed.
