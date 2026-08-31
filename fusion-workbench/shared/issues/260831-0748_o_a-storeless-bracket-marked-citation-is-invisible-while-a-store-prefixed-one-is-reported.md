# A storeless bracket-marked citation is invisible, while a store-prefixed one is reported

---
The grammar's "bracket marker not read, on purpose" stance now applies to half the form. A
bracket-marked citation carrying a store segment is reported; the same citation without one
produces no token at all. The stated reason for the silence does not hold for the population that
turns out to carry it.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## Measured

Four spellings against `hooks/lib/citation-scan.ts` at `9567ed9d`, one line each, fenced because
they are exhibits rather than pointers:

```
shared/issues/260519-0438[o]-loader-check.md   record/store-prefixed
260519-0438[o]-loader-check.md                 no token
plan 260619-1548[o] Step 8                     no token
260619-1548_o_some-slug.md                     bare-record/dangling
```

Rows one and two are the same citation, differing only in whether a store segment precedes it. Row
one is reported because the record pattern's tail was widened to admit brackets at `4cffcae4`; row
two falls to the stamp pattern, whose boundary refuses a `[` after a stamp, and produces nothing.
Row four shows the underscore form of row two being reported normally.

So the stance is already half-abandoned, and which half applies is decided by whether a store
segment happens to be present — a property of the citation's spelling rather than of the record it
names.

## Where it bit

A consuming project reported it on 2026-08-31, the morning after its code surfaces were repaired.
A colleague split one UI component into nine files derived from the originals **before** the
repair, and the nine carry five old citation forms. Four are storeless bracket form and one is
store-prefixed without a marker. Their own instrument reported none of the five; fusion's grammar,
measured above, would report exactly one of them, the store-prefixed one.

That is the regression the declared-paths work of the same night was built to prevent, arriving at
the next merge, and four fifths of it would survive fusion's checker too.

## The stated reason, and why it does not reach this case

The grammar's header says the pre-v4 bracket marker is retired syntax that `/fusion:migrate`
rewrites, and that reading it would remove the only pressure to rewrite it. That argument holds for
a workbench filename. It does not reach a citation inside a `.tsx` file: `/fusion:migrate` converts
filenames in the workbench and never opens a source file, so there is no migration pressure being
preserved by the silence. What the silence buys on a code surface is nothing, and what it costs is
the citation.

Note also that detecting is not rewriting. Since `4cffcae4` the sweep declines any rewrite whose
result the grammar cannot read back, so a detected bracket citation would be **reported and left
alone**, which is what row one already does today.

## Acceptance

A storeless bracket-marked citation is reported wherever a store-prefixed one is, or the header
states the asymmetry as a decision rather than leaving it as a consequence of two patterns having
different tails.

## Related, and not folded in

`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`
asks whether such a record may be **resolved**. This record asks only whether the citation is
**seen**. The two can be answered independently and the second is the cheaper half: row one proves
detection already works without resolution.

The consuming project filed two records of its own on 2026-08-28 describing the same shape from its
instrument's side, one for a markered record name carrying no store segment and one for a
store-prefixed citation whose basename does not end in `.md`. They are named here as the reporter's
evidence rather than as fusion's, and their stamps are fenced rather than cited, because they live in
that project's workbench and resolve from nowhere here:

```
260828-0012   the gate cannot see a markered record name that carries no store segment
260828-0130   the gate cannot see a store-prefixed citation whose basename does not end in .md
```

That is the condition filed as
`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`,
demonstrated by this paragraph: naming those two as citations put two permanent dangling rows in this
record and reddened the gate, which is how the fencing above came to be here.
