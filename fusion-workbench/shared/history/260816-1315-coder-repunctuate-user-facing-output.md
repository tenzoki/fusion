# Repunctuate rules/user-facing-output.md

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-16
**Domain:** code
**Source record:** `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
**Related:** `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md` (option 4: no gate is built, the repair is the whole intervention)

## What was done

One file, `rules/user-facing-output.md`, repunctuated. 29 replacements removed 32 em-dashes.
Each replacement is one of the four the file's own clause at `:130` prescribes: a comma, a
colon, parentheses, or two sentences. No clause was reworded, condensed, reordered or
improved. Normalised for punctuation and case, the token streams before and after are identical
at 2733 tokens, so no word was added, removed or substituted. Ten clauses that became their own
sentence take a capital ("Make", "See", "Those", "The", "It", "Nothing" twice, "That", "Split",
"Do"), and one `see` loses one where two parentheticals merged at `:9`.

## Measurement

Command from the source record:

```bash
f=rules/user-facing-output.md; w=$(wc -w < "$f"); d=$(grep -o '—' "$f" | wc -l); echo "scale=1; $d*1000/$w" | bc
```

| | words | em-dash | per 1000 | bytes |
|---|---|---|---|---|
| before | 2695 | 38 | 14.1 | 17 546 |
| after | 2663 | 6 | 2.2 | 17 455 |

The record's table quotes 14.8 against 2563 words. That measurement predates commit `52b8665`,
which added the two `## Questions and gates` bullets; the same 38 em-dashes measured 14.1 at
the start of this pass.

## The six left standing, and why

Four are inside text the file exhibits as a fault, where repunctuating would leave the "After"
version differing from the "Before" in nothing:

- `:21` — `"Genau richtig — dein Sprachgefühl stimmt"`, a quoted specimen of the sycophantic
  validation the clause forbids.
- `:33` — the German "Before" block under `## Style anti-patterns apply to everything`, whose
  caption names em-dash pile-up as the fault on display.
- `:141` — the canonical anti-example under `## Self-review before sending`.
- `:182` — the "Before" block of Example 2.

Two are mentions of the character rather than uses of the figure:

- `:130` (twice) — the code spans in "Scan for `—` used as a parenthetical break" and "One `—`
  per ~1000 words is the ceiling". Removing these would delete the subject of the clause that
  states the ceiling.

## The judgement call worth checking

Three occurrences sat in "After" blocks, which are neither the file's own voice nor an example
of the fault. They were treated as in scope, on the ground that a compliant exemplar carrying
the banned figure teaches the figure:

- `:60` and `:159` — `"Session complete — nothing for you to do."`, the same string inline and
  in Example 1's After block, now `"Session complete. Nothing for you to do."`
- `:164` — `(Bundle A — 6 steps)` in Example 1's After block, now `(Bundle A, 6 steps)`

No Before/After contrast rests on these: Example 1's Before block carries no em-dash at all, so
the pairing still contrasts on jargon, bare counts and missing user action, which is what its
caption claims.

## Fixture

`hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated per the command in
`rules-emission-golden.test.ts:170-182`. Only `user-facing-output.md` moved (17 546 -> 17 455)
and the 15 stanza totals fell by the same 91 bytes. `RULE_BASELINE` untouched; no test source
edited. No growth bound could trip on a shrink.

## Verification

`cd hooks && npm test` — exit 0, 40 files, 764 tests.

## Not done

The remaining six files of the corpus keep their rates. The scope was the user's choice at an
orchestrator gate. The source record stays `_o_` with a progress note; the decision record stays
`_a_`, because option 4's content is a falsification measurement that has not yet run.
