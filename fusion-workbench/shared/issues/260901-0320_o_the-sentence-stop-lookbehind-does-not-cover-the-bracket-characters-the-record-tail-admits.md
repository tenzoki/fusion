# The sentence-stop lookbehind does not cover the bracket characters the record tail admits

---
`SENTENCE_STOP` was written against `BARE_RE`'s tail class and applied unchanged to `REC_RE`,
whose tail admits `[` and `]` since `4cffcae4`. A bracket-marked store-prefixed citation ending a
sentence keeps the sentence's full stop inside the token, and inside the `fix` string.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/lib/citation-scan.ts`. `SENTENCE_STOP` is the lookbehind `(?<![A-Za-z0-9_…*-]\.)`. Its
character class is `BARE_RE`'s tail class minus the `.`. `REC_RE`'s tail class is strictly wider:
it also admits `[` and `]`, added by `4cffcae4` so a pre-v4 bracket-marked citation is read whole.
The two were not brought into step, so a token ending in `]` fails the "word before the stop" test
and the greedy tail keeps the stop.

## Evidence, at `dcdca34c`

Scanner over a scratch workbench, one line of prose each. The probe tokens are fenced because an
unfenced one is read as a citation by the gates, and the store segment each carries — the shared
issues store — is written `<store>/` rather than spelled: `store-prefixed` is decided from a token's
shape before any lookup, so no exemption premised on not looking a record up reaches it, the fence
included. What is under test is the tail and the stop, not which store the segment names.

```
in : see <store>/260519-0438[o].
out: '<store>/260519-0438[o].'   record / store-prefixed
     fix: cite the storeless form '260519-0438[o].'

in : see <store>/260519-0438[o]-loader-check.md.
out: '<store>/260519-0438[o]-loader-check.md'   record / store-prefixed
```

The second row is right — the `d` before the stop satisfies the lookbehind. The first is the hole:
`]` is not in the class, so the stop is taken. The reported token and the storeless form it tells
the reader to write both carry a full stop that belongs to the sentence.

Eight probes in `citation-grammar-boundaries.test.ts` cover the tail's `.` cases and none reaches
this one, because every probe there is a `bare-record` and only `REC_RE` admits a bracket.

## The acceptance test

A store-prefixed citation whose token ends in `]` and that ends a sentence produces a token without
the stop, and `citation-grammar-boundaries.test.ts` carries a row for it. The narrower fix is to
derive `SENTENCE_STOP`'s class from the tail class it is appended to rather than restating one of
them.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and reproduced.

`SENTENCE_STOP` at `hooks/lib/citation-scan.ts:296` is still `(?<![A-Za-z0-9_…*-]\.)`, and `REC_RE`'s
tail at `:323` still admits `[` and `]`. A scanner probe over this workbench, one line of prose each:

- a store-prefixed token ending `]` and closing a sentence produces a token that **keeps the stop**,
  and the `fix` string it hands the writer carries the stop too;
- the control, the same token with a basename before the stop, produces the token without it.

So the two tails are still out of step and the reported token still tells a reader to write a full stop
into a citation. `citation-grammar-boundaries.test.ts` exists now (added by `4f5834ef`, extended by
`7af91d5c`, 8 cases) and carries no row for this one.

The record shares a file and a constant with two siblings: this one and
`260901-0321_*_a-circle-record-citation-that-ends-a-sentence-produces-no-token-at-all.md` are both the
sentence stop meeting a pattern it was not derived for, and the narrower fix the record proposes —
deriving the lookbehind's class from the tail it is appended to — is the same edit that fixes both.
