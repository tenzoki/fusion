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
found with `bin/fusion-citation-check | grep "md\.'"`, all inside `archive/`. Three of them are
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
