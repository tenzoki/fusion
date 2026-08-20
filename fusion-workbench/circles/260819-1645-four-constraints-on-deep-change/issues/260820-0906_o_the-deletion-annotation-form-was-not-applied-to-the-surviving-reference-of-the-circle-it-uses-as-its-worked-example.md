The deletion annotation form was not applied to the surviving reference of the Circle it uses as its worked example

---

**Domain:** code
**Filed by:** reconciler (reconciliation 260820-0830, HEAD `04db0b0`)
**Related:** `circles/260801-1244-guard-rules-write/decisions/260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`; `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`

---

## What is wrong

Plan step 4 of this Circle wrote the deletion annotation form into `rules/circle-records.md:67`. Its
worked example, at `:103`, annotates one specific Circle — the throwaway Plane-bridge smoke test,
stamp `260802-2220`, deleted on 5 August. That is the Circle the whole decision was filed about.

The decision record that motivated the rule still names that Circle as a bare stamp-and-name token,
in the German prose of its `## Question` section, and was transitioned `_a_` → `_i_` in the same
commit (`ad7ffed`) that wrote the rule. The annotation form was written down, demonstrated on this
exact Circle, and not applied to the one surviving reference to it that the same commit had open.

`scanRecordCitations` over that file at HEAD returns **three violations**, all `stamp-name`,
all "no artifact and no Circle directory carries this name":

The three tokens are quoted verbatim below, inside a fence, because the spelling itself is the
datum here and an unfenced copy would be a fourth instance of the defect this record is about — the
gate reddened on exactly that while this record was being written:

```
line  7  260803-1412-playmaker-user-fusion-next
line  7  260803-1840-playmaker-direct-dispatch
line 14  260802-2220-throwaway-plane-bridge-smoke-test
```

## The two lines are not the same problem, and only one of them is the annotation's

**Line 14 is the annotation case.** It names the deleted Circle, and the rule now says what to write
instead.

**Line 7 is not.** Its `**Cross-references:**` field opens by saying the sources are external —
"externe Fundstelle, ausserhalb dieses Repositories" — and the two playmaker logs it names are files
in a consuming project, not in this workbench. They are correct as written and there is nothing to
repair. What is wrong is that the scanner cannot tell them from an accident: they tokenise as
`stamp-name`, `stamp-name` is inside `GATE_KINDS` since this Circle widened it, and the sentence
declaring them external is invisible to the parser. Had this record still carried `_a_`, the gate
this Circle armed would have gone red on two citations whose spelling is right.

## Why it went unnoticed

The record left the gate's corpus at the moment it became `_i_`, which is the documented narrowing
recorded at `hooks/lib/__tests__/workbench-citation-lint.test.ts:69-78` and in the corpus decision's
own footer. Both name three tokens walking out of reach at plan step 4. Neither says which three, and
neither says that one of them is the annotation form's own subject or that two of them are external
references the gate would have judged wrongly.

## What would close this

1. Rewrite line 14 in the stated form: ``Deliberately deleted 260805: Circle `260802-2220`,
   `throwaway-plane-bridge-smoke-test`.`` — replacing the bare token, per `rules/circle-records.md:97`.
2. Decide what an external reference looks like so that it neither dangles nor lies. The
   statement-versus-pointer convention at `rules/fusion-workbench-conventions.md:355` covers a
   statement *about* a citation in this repository and does not cover a pointer into another one. A
   fence would exempt it today; whether that is the intended answer is not settled anywhere.

The second is arguably a decision rather than a defect. It is filed here as one record because the
two sit on the same two lines of the same file and whoever opens it will meet both.
