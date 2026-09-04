# coder — step 5, `/fusion:setup` registers this checkout

**Status:** Complete
**Date:** 2026-09-04
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_o_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 5

## What was done

Step 0i of `skills/setup/SKILL.md` gained the registry act; Step 0c renders the
alias; the false sentence about a single asking condition was rewritten. The
byte budget was paid the way the step's third sanctioned payment names, by
relocating prose into `bin/fusion-checkout-name`'s header and citing it. The
first attempt at this step stopped because that payment had been closed by its
dispatch; this run had it open, and it was enough.

## The two files

**`skills/setup/SKILL.md`, +592 bytes.**

- Step 0i, after the `bin/fusion-identity` block: one guarded `resolve` call on
  the `CHECKOUT=` hex and four branches off it — `exit=3` unregistered (ask one
  question, then `register`), `exit=0` registered (bare `register`, act on a
  `collision=` line), no hex or no helper (write nothing, report
  `checkout-registry=unread` or `helper-missing`), and no person (register
  anyway). It closes with "The rest: that helper's header.", the pointer form
  Step 0c already uses.
- The question's substance stays in the skill — one question, the person and
  the alias, plain text with a numbered list and not `AskUserQuestion`. What is
  *offered* for each does not: that is now the helper header's.
- The false sentence "It **asks only in that condition**, which is not a normal
  run, so Step 0g stays the only step that asks on one" reads "**Two conditions
  here ask**, each at most once per checkout: that one, and a checkout with no
  registry entry."
- Step 0c's presence line gains the sixth `party=` field as the party's alias
  where it is not `-`, and drops the `scope=pulled` gloss, which
  `bin/fusion-events`' header carries in substance and which that same paragraph
  already points at.

**`bin/fusion-checkout-name`, +2 025 bytes, comment lines only.** The diff adds
23 comment lines in one new header section and 5 in an existing one, and it
removes nothing and changes no executable line: no branch, no printed string, no
exit code. Verified by `git diff | grep`, which counts 0 added lines that are not
comments and 0 removed lines of any kind, and by `bash -n` plus a live
`resolve`/`roster`/`suggest` run against the entry already on disk.

- New section, "What a caller offers before the first `register`": the three
  offers for the person and the two for the alias, why both being free text
  fixes the *form* of the asking as plain prose with a numbered list rather than
  a fixed-choice dialog, and why an answer declining every part still writes an
  entry.
- The collision section gains what a caller does with the line it already
  documents: name the other checkout, offer a rename the human may decline, and
  the declined state being a working one because the hex stays the key.

## Budget, measured

`skills/` at HEAD: total 239 833, budget 240 439 (floor 220 439 + head-room
20 000), **606 free**. After: total 240 425, **14 free**. The bound assertion
`holds skills inside its own head-room of 20000 bytes` passes, and no baseline
was edited. `agents/` and the hook-test surface are untouched.

## What was left stale, and named

Two pinned artefacts under `hooks/`, which this dispatch put out of scope with
the instruction to leave and name whatever goes stale.

- `surface-growth-bound.test.ts`, the `matches the checked-in golden` assertion:
  the golden still records `setup/SKILL.md 46639` / `total 239833`. The measured
  values are 47231 and 240425. That file's own header says regenerating the
  golden is the expected response and does not move the baseline.
- `reference-resolution-lint.test.ts`, the `BASELINE` pin: `paths` moved 1567 ->
  1569, the two new resolvable path citations this change adds. That test's own
  message says re-approving the baseline is the expected response.

## Verification

`cd hooks && npm test` — exit 1. Three suites red, none of them a defect in this
change:

- `surface-growth-bound.test.ts` and `reference-resolution-lint.test.ts` — the
  two stale pins above, left deliberately.
- `citation-sweep.test.ts` — red before this task and after it, on workbench
  records written by earlier steps of this Circle. The dispatch names it as
  expected and not mine.

818 of 821 tests pass. `path-literal-lint` is green, which is the step's own
acceptance criterion that the skill body names the helper and never the store
path.
