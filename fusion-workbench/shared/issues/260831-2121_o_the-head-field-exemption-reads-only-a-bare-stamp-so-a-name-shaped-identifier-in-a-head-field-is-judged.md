# The head-field exemption reads only a bare stamp, so a name-shaped identifier in a head field is judged

---
A head field whose whole value is a bare stamp is exempt. A head field whose value is a stamp plus a
name is not, so an identifier that names no record and never will is reported as a dangling citation.
The exemption's narrowness is deliberate and its boundary is drawn in the wrong place.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Reported by:** the consuming project `unite-co-creator`, 2026-08-31, as its own `260831-1340`

## Reproduced here

Against `hooks/lib/citation-scan.ts` at `8b0eda50`, three head fields:

```
**Date:** 260722-1943                                    stamp-bare/exempt(head-field)
**Bus session:** 260722-1943-some-identifier             stamp-name/dangling
**Active spec/plan:** 260830-1841_*_citation-…md         bare-record/resolved
```

The exemption fires on the first because it is gated on `kind === "stamp-bare"`. The second carries a
name, reaches the classifier as `stamp-name`, and is judged. The reporter measured 20 such rows.

## fusion's own tree carries none, and that is worth saying

`grep -rc '\*\*Bus session:\*\*' fusion-workbench/` finds no file. The bus protocol was removed in
v3.15.0 and its records have since been archived or cleaned. So the grammar defect is fusion's and
every instance of it is the reporter's, which is the ordinary shape of a defect found downstream and
not a reason to discount it.

## Why widening the gate is not the fix

The third row is why. `**Active spec/plan:**` carries a real citation that the orchestrator resolves,
and the file header says the narrowness is deliberate for exactly that reason. Exempting every head
field whose value is name-shaped would blind that one, and it is the field two mechanical readers
depend on.

So the question this record leaves open is which decidable property separates them, and it is not the
token's kind. Two candidates, neither endorsed here: the **field name** on the left of the colon,
which is an enumeration somebody has to maintain and which grows with every project's own head
fields; or a rule that a head-field value resolves or is exempt but never dangles, which reads the
result rather than the text and would silently hide a genuinely broken `**Active spec/plan:**`.

## Acceptance

No row whose token is a head-field value that names no record, with no head field edited, and
`**Active spec/plan:**` still judged. Whatever separates them is named in the header as a property
rather than as a list of fields, or the record says plainly that an enumeration was chosen and why.

## Neither of the two usual repairs applies

A fence would call the value an exhibit, and it is not: there is nothing to point at. A rewrite would
invent a target. This is the one class in the corpus where the citing text is right, the record does
not exist, and both are correct at once.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open. Its two siblings closed at this pass
and this one did not, for the reason the plan gave: it is the step blocked on a user answer.

`hooks/lib/citation-scan.ts:912` still reads
`kind === "stamp-bare" && isHeadFieldValue(...)`, the clause the record quotes, and
`grep -rn IDENTIFIER_HEAD_FIELDS hooks/` finds nothing. The three probes reproduce exactly as filed: a
bare stamp in a head field is `exempt(head-field)`, the same stamp plus a name is `stamp-name/dangling`,
and a real record citation in a head field resolves.

The blocking question `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md`
stands at `_o_` **with no recommendation** — the plan recommended the field-label enumeration and a
measurement appended to that record on 260831-2215 refuted it, on the same kind of evidence that
refuted the third candidate: one label carries both kinds under the same name. The record names a
fourth direction, classifying an unresolvable head-field value `undecidable`, and says plainly it was
never put to the user.

So this defect is blocked on a user ruling and not on work, and nothing about it can be fixed by
dispatching an executor.
