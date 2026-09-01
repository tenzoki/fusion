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
unfenced one is read as a citation by the gates:

```
in : see shared/issues/260519-0438[o].
out: 'shared/issues/260519-0438[o].'   record / store-prefixed
     fix: cite the storeless form '260519-0438[o].'

in : see shared/issues/260519-0438[o]-loader-check.md.
out: 'shared/issues/260519-0438[o]-loader-check.md'   record / store-prefixed
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
