The reconciler's review annotation wrote two hard-marker citations, and one of them died one commit later — inside the range whose decision is about exactly that

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `260823-1410-coderev-c2-turn-3.md:107` and `:125` (the `Reconciliation annotation, 260823-1446` block appended by `d2089e4`)
**Cross-references:** `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`, whose option 3 this falsifies; `260806-0015_*_zitierform-fuer-workbench-records.md`, the wildcard citation form; `260823-1402_*_four-hard-marker-citations-of-the-c1-circle-record-dangle-in-the-same-files-this-turn-repaired.md`, the same class two Turns earlier

---

## What is wrong

`d2089e4` appended a reconciliation annotation to the Turn 3 review file. It carries two record citations spelled with a hard marker rather than the `_*_` wildcard, and `2ec2bc2` — the very next commit — killed one of them.

At `:125`:

```
`260823-0800_o_the-groundings-first-write-outside-the-workbench-claim-was-already-false-when-it-was-written.md`
is filed on the claim being false when written, and a note further down the same file leaves that true.
Both records stay `_o_` after a closure note, …
```

`2ec2bc2` renamed that record `_o_` → `_c_` (`git show --stat -M 2ec2bc2` reports the rename with `R075`). The citation resolves to nothing at HEAD, and the sentence beside it — "Both records stay `_o_` after a closure note" — is now false of one of the two.

At `:107` the same annotation cites `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`, also with a hard marker. That one resolves today and will die the moment the decision is answered, which is the transition the record exists to invite.

Scanned across every review file at HEAD, these are the **only** two hard-marker record tokens in any review of a non-terminal Circle. Both were written in this range, by the same annotation.

## Why this is more than two characters

**It falsifies a measurement in an open decision, one commit after that decision recorded it.** `shared/decisions/260823-1414_*` option 3's stated Pro is:

> the repair debt is **zero today**: the three reviews in non-terminal Circles carry 0 dangling hard-marker citations, because this Circle repaired them by hand.

That was true when written. Re-measuring with the record's own method at each commit in the range:

| Ref | reviews of a non-terminal Circle | record tokens | dangling |
|---|---|---|---|
| `a2a18f9` | 2 | 0 | 0 |
| `1544224`, `7cd79f1` | 3 | 0 | 0 |
| `2ec2bc2` (HEAD) | 3 | 2 | **1** |

Option 3's distinguishing advantage over option 2 is precisely that it costs nothing to arm today. It now costs one repair, and the repair debt was created after the option was costed, by the pass that costed it.

**And it is the class demonstrated, again, inside the pass looking for it.** The decision's own Question says a review file "carries a `Record:` pointer per finding by construction, so every finding a later pass closes breaks a citation in the review that raised it", and lists two instances of this Circle missing that class while its own pass was watching. This is the third, and it is the first one the project wrote *into* a review rather than merely failed to repair.

**No gate sees it.** Review files are outside `inCorpus` (`hooks/lib/__tests__/workbench-citation-lint.test.ts:167-176`), which is the whole subject of `260823-1414_*`. `npm test` is green at HEAD with this citation dangling — 723 of 724, the one failure being `monitor-warnings-panel.test.ts`, unrelated and in a file this range never opened.

## Verified

Scanned every file matching `circles/*/reviews/*.md` and `shared/reviews/*.md` at `a2a18f9`, `1544224`, `7cd79f1` and `2ec2bc2`, extracting `YYMMDD-HHMM_x_<slug>.md` tokens outside fenced blocks and resolving each against that tree's own filenames — the method `shared/decisions/260823-1414_*` `## Measured` describes. Confirmed the rename with `git show --stat -M 2ec2bc2`. Confirmed `260823-0800_*_…` is the file on disk and no `_o_` sibling exists. Read `inCorpus` at `hooks/lib/__tests__/workbench-citation-lint.test.ts:167` and confirmed no clause admits a `reviews/` path.

## Direction, not a prescription

Two separable things, and they are not the same size.

**The citations.** Star both markers in the annotation — `260823-0800_*_…` and `260823-1414_*_…` — which is the form `260806-0015` ratified and the form the rest of this Circle's repairs used. That is the repair, and it restores option 3's measured cost to zero before anyone decides on it.

**The sentence beside `:125`** is a statement about state on a dated pass, not a pointer, so `rules/fusion-workbench-conventions.md:358` says leave the letter on it and name the citing line instead of spelling the address. Whoever repairs the citation should not silently rewrite the claim: the annotation is dated `260823-1446` and was true then.

**The class** is `260823-1414_*`'s to answer, and this record deliberately does not pre-empt it. But it moves the evidence: the option that looked free is not, and the writer that produced the dangling citation is an agent following no rule that told it otherwise, which is what that decision's option 4 is about.

---
Resolved by the reconciler that wrote the defect, second Coherence pass, 260823-2130-reconciliation.md. Both tokens in
`260823-1410-coderev-c2-turn-3.md` now carry the wildcard: `:107` cites
`260823-1414_*_…` and `:125` cites `260823-0800_*_…`. Both resolve at HEAD — the
second had been dangling since `2ec2bc2` renamed its target `_o_` → `_c_`, one commit after the
annotation was written.

The finding's load-bearing consequence is discharged with them. A fresh scan of every review file in
this Circle, the only non-terminal Circle in the tree, returns **zero** hard-marker record tokens, so
the measured repair debt behind option 3 of
`260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md` is
back to the zero that option was costed on. The decision can be answered against its own stated
figure again.

Worth stating plainly rather than fixing quietly: this was the reconciler committing, inside the
Circle, the exact defect class the Circle had spent three Turns repairing, and no gate caught it —
review files sit outside `inCorpus`, which is the subject of the decision the defect was moving the
cost of.

Closed by reconciler, second Coherence pass, 260823-2130-reconciliation.md.
