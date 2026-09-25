# coder — step 6, `/fusion:next` names the holder instead of its hex

**Status:** Complete
**Date:** 2026-09-04
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 6

## What was done

Step 6.1 of `skills/next/SKILL.md` renders the holder of a claimed `_t_` Circle
through `bin/fusion-checkout-name resolve` instead of printing the claim's raw
hex, and says in the same breath that the comparison behind the refusal is
untouched and why. The mechanics of the rendering — the `held by <person> on
<alias>` line, the fields an entry may not carry, and the three cases that
render exactly what the site rendered before this program existed — moved into
`bin/fusion-checkout-name`'s header, the payment route step 5 used and this
dispatch sanctioned. The skill cites the header; it does not restate it.

## The two files

**`skills/next/SKILL.md`, 27 601 -> 27 604, +3 bytes.** Two lines changed, both
inside Step 6.1.

- The claim paragraph gains the guarded `resolve <the claim's checkout>` call
  and the sentence the step mandates: *That renders and decides nothing: the
  comparison stays on the hex and the person as written, values both sides hold
  locally; one reading a pulled file would answer differently across a fetch.*
  Every branch it already carried stands — `Claimed `, `Unclaimed`, an absent
  field, this checkout's own identity, the takeover, the leave, and the partial
  identity of exits 3, 4 and 5.
- Three restatements were compressed to pay for it, no branch among them: the
  marker-glob explanation in 6.1's opening paragraph, which restated
  `rules/fusion-workbench-conventions.md` `## Marker globs` in the same sentence
  that cites it and which 6.2 restates again eleven lines below; the clause
  "so the first sentence stays and both identities stand in the record", which
  is `rules/circle-records.md` `### The claim field`'s own text and stays cited;
  and the partial-identity sentence, which keeps its exits, its pointer and its
  "compose nothing".

**`bin/fusion-checkout-name`, 17 118 -> 18 658, +1 540 bytes, comment lines
only.** 28 comment lines in one new section, `## Naming a holder, and why the
name never enters a comparison`. Nothing removed, and no executable line
touched: no branch, no printed string, no exit code. Measured by `git diff |
grep`, which counts 0 added lines that are not comments and 0 removed lines of
any kind inside the section, and confirmed by `bash -n` plus live runs of
`resolve 5e8248d7` (exit 0, `alias=west-harbor`) and `resolve deadbeef`
(exit 3, nothing on stdout).

The section carries three things: the rendering itself, taking `person=` over
the claim's own spelling of the same human and carrying only the field an entry
has; that exit 3, a missing helper and a claim with no hex each render what the
site rendered before this program existed, with no third rendering and no
substituted alias; and that no caller may route a comparison through `resolve`,
because an entry is a pulled file and a comparison reading one would answer
differently before and after a fetch.

## The acceptance criterion

The diff shows a rendering change and no change to any test in the claim
comparison. No file under `hooks/lib/__tests__/` is in this change, and the
comparison's authoring home, `rules/circle-records.md` `### The claim field`, is
untouched and still cited from both files.

## Budget, measured

`skills/` before: total 239 833 with `next/SKILL.md` at 27 601, budget 240 439
(floor 220 439 + head-room 20 000), 606 free at HEAD and **14 free** after step
5 landed. After this change: total 240 428, **11 free**. The bound assertion
`holds skills inside its own head-room of 20000 bytes` passes and no baseline
was edited. `agents/` and the hook-test surface are untouched, and no `bin/`
helper is inside any bound.

## What was left stale, and named

Three pinned artefacts, all under this dispatch's leave-and-name instruction.

- `surface-growth-bound.test.ts`, `matches the checked-in golden`: the golden
  records `next/SKILL.md 27601` / `setup/SKILL.md 46639` / `total 239833`
  against measured 27 604 / 47 231 / 240 428. Steps 4, 5 and 8 moved it first;
  this change adds 3 bytes to the drift.
- `reference-resolution-lint.test.ts`, the `BASELINE` pin. Measured with this
  change reverted in place and restored afterwards: without it `paths` reads
  1 569 against a pinned 1 567, so the test was already red. With it, 1 571 and
  `anchors` 218 against 217. This change contributes **paths +2, anchors +1**:
  the `bin/fusion-checkout-name` call site in the skill, and the
  `rules/circle-records.md` `### The claim field` citation in the new header
  section, which is one path and one anchor.
- `citation-sweep.test.ts` — red before this task and after it, on workbench
  records earlier steps wrote. Named as expected by the dispatch.

## Verification

`cd hooks && npm test` — exit 1. 820 of 823 tests pass; the three failures are
the three pins above and none is a defect in this change.
