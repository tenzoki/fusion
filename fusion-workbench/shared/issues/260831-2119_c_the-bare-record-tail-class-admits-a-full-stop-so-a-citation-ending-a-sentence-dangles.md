# The bare-record tail class admits a full stop, so a citation ending a sentence dangles

---
A citation written in the correct storeless form dangles when it ends a sentence. The tail class
admits `.`, so the full stop is absorbed into the basename; the matcher then treats the token as a
prefix and requires a literal character after `.md`, which no file has.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Reported by:** the consuming project `unite-co-creator`, 2026-08-31, as its own `260831-1339`

## Reproduced here

Against `hooks/lib/citation-scan.ts` at `8b0eda50`, one line each, the same citation twice:

```
see 260819-1645_*_what-defines-the-citation-gates-corpus…md     bare-record/resolved
see 260819-1645_*_what-defines-the-citation-gates-corpus…md.    bare-record/dangling
```

The reporter measured 31 rows over 26 distinct tokens in its tree. **fusion's own tree carries 11**,
found with `bin/fusion-citation-check | grep "md\.'"`. **Five of the 11 are inside `archive/` and six
are not**, correcting an earlier "all inside `archive/`" in this paragraph: the six sit under a
Circle's `history/`, a Circle's `analyses/`, a `_c_` issue, an `_i_` decision, and `shared/history`
twice. The count of 11 was right and the placement claim was not. Three of them are
citations of real records in `260801-1253_*_plan-guard-bash-inspection.md` and
`260717-1938_*_branch-switch-guard-not-invoked-live-harness-pretooluse-bash.md`.

## Why it is the tail class rather than the matcher

`BARE_RE`'s tail is `[A-Za-z0-9._…*-]*`, which includes `.`, so the token spans one character past
the basename. `basenameMatcher()` then applies its documented rule that a citation not ending in
`.md` is a **prefix**, and builds a pattern requiring something after the extension. Both halves are
behaving as written; the defect is that the tail claims a character that ends a sentence rather than
a filename.

## The cost, and why re-punctuating is not the remedy

A citation at the end of a sentence is ordinary prose, and the convention this repository states
asks writers to cite by storeless basename without saying they may not put a full stop after one. The
reporter's project arms a blocking gate on this measurement, so correct prose turns its build red and
the only local remedy is to move a full stop to satisfy a matcher. That is the tail wagging the
convention.

## Acceptance

No row whose quoted token ends `.md.` over the same corpus, with no citing line re-punctuated. Watch
two neighbours while fixing it: a citation legitimately continues past `.md` in a truncation
(`…md…`), and the ellipsis rule and the prefix rule both read the same tail class.

## Not the same as the trailing-tail repair

`--repair`'s `chained-tail` class strips a marker tail that the retired bare-stamp rule appended. This
is a full stop that was always in the prose, so no repair pass should rewrite the line: the fix is in
the grammar, and the citing text is already correct.

---
Resolved: `4f5834ef` gave `BARE_RE` and `REC_RE` the same trailing lookbehind, held in one constant
`SENTENCE_STOP` at `hooks/lib/citation-scan.ts:296` and appended at `:324` and `:354`, which is step 1
of the plan `260831-2144_*_repair-three-citation-grammar-defects.md` taken as written.

Verified at HEAD `5b84b13a`, each figure the command's own output rather than a reading of the diff:

- `node hooks/dist/citation-check.js | grep -c "md\.'"` returns **0**; the record's own measurement was 11.
- A scanner probe over this workbench, one line each: the same citation with and without a closing
  full stop both produce one `bare-record` token ending at `.md`, status `resolved`. The stop is left
  in the prose.
- `cd hooks && npm test`: 50 files, 864 tests, green.

The record's own correction stands and is not folded away: of the 11 rows, five were inside the
frozen store and six were not.

Two neighbours the acceptance told the fixer to watch were checked and are unmoved: a truncation
continuing past `.md` still tokenises whole, and the ellipsis rule reads the same tail class. The one
residual the plan named is unchanged behaviour and not a new hole — a run of stops after a basename
is left exactly as it was.
