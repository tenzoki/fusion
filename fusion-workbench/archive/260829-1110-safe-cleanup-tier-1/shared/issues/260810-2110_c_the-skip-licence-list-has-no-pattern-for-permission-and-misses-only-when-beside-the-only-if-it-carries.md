The skip-licence list has no pattern for permission, and misses "only when" beside the "only if" it carries

---

`45d76f0` widened `SKIP_LICENCES` (`hooks/lib/__tests__/state-drift-detection-lint.test.ts:209-245`)
from 16 to 26 patterns, all of them negations, conditionals or time-permitting phrases. Not one
addresses **modality**. An editor who softens the drift check from an instruction to a permission —
the most ordinary way English does this — passes every one of the 26.

---

**Measured** by replicating `plain()`, `sentences()` and the scan loop at `:308-321` against the
declared list, splicing each clause into the bound `session_end` line. All of the following pass:

| Class | Phrasings that pass |
|---|---|
| Bare permission | "you **may** run the drift check", "you **can** run the drift check", "**consider** running the drift check" |
| Soft recommendation | "running the drift check **is recommended**", "**is encouraged**", "run it **ideally**" |
| Advisory framing | "the drift check **is advisory**", "**is discretionary**", "**is non-blocking**", "**is a nice-to-have**" |
| Deferral without the word | "the drift check **can wait** until the next session", "though it **can wait**" |
| Exclusion synonyms | "**forgo**", "**waive**", "**bypass**", "**leave out**", "**is exempt** for a single-Turn session" |
| Conditional near-synonyms | "**only when** a prior session left state behind", "**if applicable**", "**if relevant**", "**as needed**", "**where practicable**", "**whenever feasible**" |

Thirty-six probes were run; all thirty-six pass.

**"only when" is the sharpest of them.** `\bonly if\b` is on the list and has been since before this
commit. `only when` is its exact synonym and is not. That is the same defect shape the motivating
issue described — *"`\bunless\b` is listed, its synonym is not"* — reproduced inside the repair that
closed it, and it costs one alternation to fix.

**The bare-permission class is the one worth weighing most.** "You may run the drift check in the
same command as that `turn_end` emission" reads to a human as the check being optional at the call
point that fires every Turn, which is exactly the condition issue `260801-2038` measured four times.
It preserves the mention and the binding phrase, so `assertRidesAnAct` accepts it.

**This does not contradict the header.** `:57-63` states plainly that the list is a blacklist,
incomplete by construction, and that the absence of a failure proves nothing. That claim holds. What
is filed here is coverage — and specifically that the list's whole vocabulary is negation-shaped,
so it has a systematic blind side rather than scattered gaps.

**Fix direction, and a caution against the obvious one.** Adding twenty more patterns is what
`rules/critical-stance.md` §4 calls a longer approximation of an undecidable question, and the test's
own header at `:71-88` already says so and names the alternative: pin the check-mentioning sentences
of each act window, whitespace-normalised, against a baseline literal. That change closes the whole
vocabulary class including everything above. It is deferred in `45d76f0` for a stated sequencing
reason (a queued task rewrites the drift-check prose). This record is the case for taking it rather
than growing the list once more — but if the list does grow first, `only when`, `may`, `can`,
`consider`, `recommended` and `advisory` are the six with the best cost-to-coverage ratio.

**Cross-references.** `hooks/lib/__tests__/state-drift-detection-lint.test.ts:57-88, 194-245, 306-322`;
`shared/issues/260810-1918_c_the-skip-licence-blacklist-misses-every-negation-that-does-not-use-the-word-not.md`;
`shared/decisions/260810-2032_o_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.

---
Resolved: Its whole subject, the SKIP_LICENCES blacklist in hooks/lib/__tests__/state-drift-detection-lint.test.ts, was deleted with the state-drift mechanism in f45f76a; SKIP_LICENCES returns nothing anywhere at HEAD.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147, after a re-verification pass against HEAD confirmed the condition no longer holds.
