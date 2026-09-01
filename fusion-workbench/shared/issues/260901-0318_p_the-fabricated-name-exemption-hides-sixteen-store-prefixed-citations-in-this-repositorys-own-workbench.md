# The fabricated-name exemption hides sixteen store-prefixed citations in this repository's own workbench

---
`token.includes("foo")` fires on `footer`, so sixteen real store-prefixed citations are exempt.
The checker prints `store-prefixed=0`, the sweep prints `rewrites=0`, and the release gate that
asserts `rewrites=0` over this tree is green over a tree that still carries the retired spelling.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/lib/citation-scan.ts`, the `consider()` exemption chain, exempts a token whose text
includes `foo` with the reason `fabricated-name`. The test is a bare substring, so it fires on
every English word containing those three letters. `footer` is the one this corpus is full of.

An exempt token is never judged by `bin/fusion-citation-check` and never rewritten by
`bin/fusion-citation-sweep`: `rewriteOf()` in `hooks/citation-sweep.ts:457` returns `null` on
`hit.status === "exempt"` before the visibility guard is reached.

## Evidence, measured at `dcdca34c`

Scanning the checker's own corpus with the shipped grammar: 22 481 tokens, 42 exempt with reason
`fabricated-name`, of which **17** carry `foo` inside a longer word and **16 of those 17 are
store-prefixed** — the spelling the storeless form retired and the sweep exists to rewrite.
Fourteen distinct tokens, in twelve files, spanning `shared/`, three live Circles and `archive/`.
Two of them sit in review files and three in a live plan. Every one names a real record whose
slug contains `footer`.

The visible consequence, from the same commit:

- `node hooks/dist/citation-check.js` prints `store-prefixed=0`
- `node hooks/dist/citation-sweep.js --dry-run` prints `files=0 rewrites=0`

## Why this is not the record already filed

`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
is the same mechanism read the other way: a fabricated fixture that carries no `foo` is judged as a
real citation, and the cost is a false violation row. This is the false negative, and it costs
more: the exemption is what a release gate's green rests on. Whoever answers either record should
answer both, because a keying property that fixes one direction settles the other.

## The acceptance test

`bin/fusion-citation-sweep --dry-run` over this repository reports the sixteen store-prefixed
tokens, or the exemption keys on a property that no real record's slug can satisfy. Either way
`citation-sweep.test.ts`'s `rewrites=0` gate must stop being satisfiable by invisibility.

## In progress, 2026-09-01 — the exemption is a word test, the repair is not run

`hooks/lib/citation-scan.ts` now asks `FABRICATED_NAME`, which matches the placeholder only where
the slug's own delimiters open and close it, and the file header says so beside the other
exemptions. `bin/fusion-citation-check` reports `store-prefixed=16`, exactly the sixteen this
record names, plus one further `footer` token now visible as `stale-marker`;
`bin/fusion-citation-sweep --dry-run` reports
`files=12 rewrites=17 residual=2842 record=16 circle-record=0 circle-dir=0 bare-record=1 stamp-bare=0`.
`citation-sweep.test.ts`'s `rewrites=0` gate is red, which is this record's acceptance test
reading true: the gate is no longer satisfiable by invisibility.

The dispatch spelled the test `\b`-delimited. That would have been wrong the other way — `_` is a
JavaScript word character, so the seven `foo` fixtures spelled with a marker would have stopped
being exempt. The delivered predicate uses the slug's delimiters instead, and the two spellings
were compared over all 44 exempt tokens before the edit.

Still open, and the reason this stays `_p_`: the sixteen are not yet rewritten. The sweep's
`--write` is a hand-run act behind its own census guard and belongs to the user, and nothing here
is committed. Session log:
`260901-0332-coder-the-fabricated-name-exemption-becomes-a-word-test.md`.
