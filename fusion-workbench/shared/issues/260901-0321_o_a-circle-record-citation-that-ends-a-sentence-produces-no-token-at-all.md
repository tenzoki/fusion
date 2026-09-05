# A Circle-record citation that ends a sentence produces no token at all

---
`4f5834ef` gave `BARE_RE` and `REC_RE` the sentence-stop lookbehind and left `CIRCLE_REC_RE`
alone. Its trailing lookahead refuses a `.`, so such a citation at a sentence end matches nothing
and no pattern picks it up. The violation is not reported dangling; it is not reported at all.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/lib/citation-scan.ts`, `CIRCLE_REC_RE`. The pattern ends `(?![A-Za-z0-9_.\/-])`, and `.` is
in that class. With a full stop after the citation the lookahead fails, the optional `(?:\.md)?`
backtracks to empty, the lookahead fails again, and the whole pattern fails at that start. `REC_RE`
needs a store segment and finds none; `CIRCLE_RE` refuses the `/` that follows the directory;
`BARE_RE` and `STAMP_RE` refuse the `/` in front of the stamp. Nothing matches.

That is one class worse than the defect `4f5834ef` repaired for the other two patterns. There the
citation dangled and was reported; here it is silent.

## Evidence, at `dcdca34c`

Scanner over a scratch workbench holding one live Circle directory. The probe lines are fenced
because an unfenced one is read as a citation by the gates, and the `circles/` segment in front of
the directory is written `<circles>/` rather than spelled: `store-prefixed` is decided from a
token's shape before any lookup, so no exemption premised on not looking a record up reaches it,
the fence included. What is under test is the sentence stop after `.md`, not the segment.

```
in : see <circles>/260820-0900-live-circle/_t_circle.md.
out: NO TOKEN

in : see <circles>/260820-0900-live-circle/_t_circle.md and more
out: the whole token, circle-record / store-prefixed
```

Not instantiated in this repository today: every live Circle-record citation here is followed by a
space or a newline. That is what makes it latent rather than measured, and it is reachable the
first time somebody ends a sentence with one.

## The acceptance test

The line in the first probe above produces one `circle-record` token spanning up to `.md`, and
`citation-grammar-boundaries.test.ts` carries a row for it. The bounded fix is the one the other
two patterns took: end the pattern with `SENTENCE_STOP` rather than with a lookahead that refuses
the stop outright.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and reproduced against a live Circle
directory rather than against a scratch one.

`CIRCLE_REC_RE` at `hooks/lib/citation-scan.ts:339-345` still ends `(?![A-Za-z0-9_.\/-])`, the lookahead
that refuses the stop, where its two neighbours now end in `SENTENCE_STOP`. A scanner probe over this
workbench, naming a Circle that exists here:

- the citation followed by a full stop — **no token at all**;
- the same citation followed by a space — one `circle-record` token, whole.

Still latent in this tree, as the record says: no live Circle-record citation here is followed by a stop.

Same file and same constant as `260901-0320_*_the-sentence-stop-lookbehind-does-not-cover-the-bracket-characters-the-record-tail-admits.md`,
and the bounded fix the two records propose is one edit: give this pattern the shared lookbehind and
derive that lookbehind's class from the tail it closes.
