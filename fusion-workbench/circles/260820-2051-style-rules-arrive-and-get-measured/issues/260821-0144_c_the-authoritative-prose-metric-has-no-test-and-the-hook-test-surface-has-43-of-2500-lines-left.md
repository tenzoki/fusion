The authoritative prose metric has no test, and the surface that would carry one has 43 of 2500 lines left

---

Two facts that only matter together.

**`bin/fusion-prose-metric` is authoritative and untested.** Two of this Circle's four Directive outcomes are numbers this program produced, and `260820-2354-prose-register-measurement-protocol.md` §2 makes it binding on a Circle that has not started: "It is the authoritative count. No hand count and no `grep` line substitutes for it, in either window." The post-repair window will be measured by a later session, against 5.0 per 1000, with this program. Nothing in `hooks/` executes it — `grep -rln "fusion-prose-metric" hooks/` returns one file and it is a comment in `reference-resolution-lint.test.ts`.

**The omission was budget-driven, and it is recorded as such.** Commit `fac97f4`: "No hook test file was added; the surface has 108 lines left, down 8 from the note that re-approves the citation gate's count pin."

**The surface now has 43 lines left of 2500.** Measured at HEAD `7832553` against `TEST_LINE_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts:310-350`: growth 2457, head-room `TEST_LINE_HEAD_ROOM = 2_500` (`:355`), remaining 43. That is 98.3 per cent consumed.

**Of the 73 lines this Turn added to it, 40 are prose.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` went 1360 to 1400 lines, and the whole of that diff is comment: three re-approval notes above `const BASELINE`, one per commit that moved a count pin. The remaining 33 lines are the two real test cases in `rules-voice-profile.test.ts`. So the tightest of the four bounded surfaces spent 55 per cent of this Turn's allocation on documentation of a constant, while the Circle's most consequential new program went untested for want of room on the same surface.

`hooks/lib/__tests__/helpers/growth-bound.ts:27-52` is explicit that the way out of a red bound is a cut, never an edit to the baseline. One more re-approval note the size of this Turn's three fails the suite.

**This is not an argument against the re-approval convention.** The convention is why the count pin can be trusted at all. It is an argument that a prose obligation and executable test lines are being charged to one budget derived from what test code costs to maintain and to run (`surface-growth-bound.test.ts:392`: "every line is maintenance and suite wall-clock, paid on every run"), and a comment above a constant costs neither.

**Verified at HEAD `7832553`** by summing `TEST_LINE_BASELINE` against a recursive line count of `hooks/lib/__tests__/**/*.ts`; by `git diff 7135a19..HEAD -- hooks/lib/__tests__/reference-resolution-lint.test.ts`, which is `-1 +41` and entirely `//` lines plus the changed constant; and by `grep -rln "fusion-prose-metric" hooks/`.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder`.
**Severity:** Medium, and it is a sequencing item rather than a defect. Nothing is broken. A later Circle will compare a number against 5.0 with a program no gate protects from a regression, and the surface where that gate would live cannot currently accept one.
**Direction, not a prescription.** Two independent questions, and the second is not this record's to answer: whether the metric gets a test, and whether a re-approval comment belongs on the same budget as test code. The exclusion `surface-growth-bound.test.ts:398-403` already makes for `fixtures/` — machine-written records of other surfaces' size, not TypeScript anybody maintains — is the nearest precedent for the second.
**Cross-references:** `260820-2354-prose-register-measurement-protocol.md` §2 and §7 (what depends on the program); `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` (why the baseline may not simply move).

---
Resolved: `hooks/lib/__tests__/fusion-prose-metric.test.ts` (162 lines, 9 cases) drives the real `bin/fusion-prose-metric` through `child_process` and pins what its own header documents as authoritative: the em-dash and prose-word counts with the `/1000`, `permit` and `verdict` columns; each of the four regions that are not prose in its own case (fenced block with both fence lines, inline code span with its delimiters, whole block-quote line, and the `examples:`/`anti_examples:` subtree in a `.yaml` profile, with the same text as `.md` counted as prose to pin that region 4 is keyed on the extension); the case the program exists for, a fixture whose exhibits give 7 to a whole-file `grep -o` and 1 to the metric; the narrowing to `—` U+2014 with `–` U+2013 and `-` U+002D ignored; and the exit-code table, including that an `over` verdict still exits 0. Expected numbers were derived by hand from the header's rule and then confirmed against the program, so the test pins the documentation rather than the implementation.

Two things this note does not claim. **The 43 lines in this record's title are long stale.** The surface stood at 464 lines of head-room before the test file landed and at 302 after, both measured by summing `TEST_LINE_BASELINE` over the files present and comparing against a recursive newline count of `hooks/lib/__tests__/**/*.ts`. The room was bought by the cut in `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` step 2, not by this fix; without that cut this file could not have landed at all, which is what the record's severity line called a sequencing item. No baseline map moved.

**The record's second question is not closed by this.** Whether a re-approval comment belongs on a budget derived from what test code costs to maintain and to run is filed as `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` and is open. The record itself named it as not this record's to answer.
