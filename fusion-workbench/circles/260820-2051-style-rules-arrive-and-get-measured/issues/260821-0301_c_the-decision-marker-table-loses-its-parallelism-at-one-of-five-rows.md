The decision-marker table loses its parallelism at one of five rows

---

`rules/fusion-workbench-conventions.md` `## State Markers — decisions` is a five-row definition
table. Before `c226949`, every row read `Marker — gloss`. After it, four read `Marker: gloss` and one
does not.

```
:316  | `_o_` | Open: the question has been filed but not yet answered. …
:317  | `_a_` | Answered: a recorded answer exists somewhere on disk …
:318  | `_i_` | Implemented. The answer has been realised: code or data on disk now reflects …
:319  | `_d_` | Deferred: the user explicitly pushed the decision out …
:320  | `_s_` | Superseded: a later decision has overridden this one. …
```

`:318` is the one table token the record names and defends: the row already carried a colon, "and a
second one in the same clause would have stacked". The reasoning about stacking is right, and the
issue filed at `260821-0300` is about the four places where it was not applied. The cost it does not
name is this one: a definition table an agent reads as a lookup now has one row whose gloss is not
introduced the way the other four are, so `_i_` alone reads as a marker followed by an assertion
rather than a marker followed by its definition.

The four-row issue table at `:296-299` is fully parallel, which makes the odd row more conspicuous
rather than less: an agent comparing the two vocabularies sees one construction in one table and two
in the other.

---
**Found by:** coderev, review gate R1 of `circles/260820-2051-style-rules-arrive-and-get-measured`,
review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0257-coderev-turn-2-the-repunctuation-and-the-repaired-step-0e.md`.
**Owner:** `coder`.
**Severity:** Low. No definition changed. The cost is that a normative lookup table lost a shape it
had, on the surface every agent loads on every dispatch.
**Filed in the Circle store** per the Origin Rule.
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0300_*_four-replacements-stack-a-second-colon-in-one-sentence-which-the-pass-states-it-avoided.md`
(the same trade-off resolved the other way, four times);
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0242_*_step-12s-two-acceptance-criteria-cannot-both-hold-because-21-of-the-115-em-dashes-are-in-table-cells.md`
(the step's own table-scope contradiction).

**Verified at HEAD `c226949`** by reading `rules/fusion-workbench-conventions.md:296-299` and
`:316-320` against `git show b393a45:rules/fusion-workbench-conventions.md`.

**The fix, and it costs no word and creates no stack.**

```
| `_i_` | Implemented: the answer has been realised. Code or data on disk now reflects the decision. …
```

The em-dash becomes the colon the other four rows use, and the internal colon becomes the full stop.
One token gains a capital (`code` → `Code`), which is the same class of change the pass makes at its
11 split sites, and the token stream is otherwise unmoved. All five rows are then parallel and no
sentence carries two colons.

---
Resolved: fixed — the _i_ row takes the colon the other four use; the internal colon became ', and' rather than a full stop and capital, because a capital 'Code' drops the row out of the domain-cascade hole measurement (hooks/lib/domain-cascade.ts REACH.holes[0].cost) and that pin is outside this step's files; no sentence carries two colons; rules/fusion-workbench-conventions.md:323
