# coder — step 5, `/fusion:setup` registers this checkout

**Status:** Blocked — stopped at the step's own stopping condition, no edit made
**Date:** 2026-09-04
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_o_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 5

## What was asked

Step 0i of `skills/setup/SKILL.md` gains the registry act: four branches off
`bin/fusion-checkout-name resolve`, one plain-text question with a numbered list,
the false sentence rewritten to name the once-per-checkout conditions, and one
clause in Step 0c rendering the sixth `party=` field. The step makes its byte
budget an acceptance criterion, not a note.

## Why it stopped

The `skills/` surface has **606 free bytes** at HEAD (`floor 220 439 + head-room
20 000 = budget 240 439`, `total 239 833`), which reproduces the figure the plan
states. The smallest version that keeps every branch and the question's substance
measures **+881 bytes** on `skills/setup/SKILL.md` — **275 over**. That figure is
measured, not estimated: the candidate was built on a scratch copy and weighed
against `git`'s HEAD copy.

The candidate is already paying inside the file: it drops the `scope=pulled` gloss
in Step 0c ("only what this checkout has pulled, so a session started elsewhere
since the last fetch is invisible, not absent", 110 bytes), which the
`bin/fusion-events` header carries verbatim in substance and which that paragraph
already points at with "The rest: that helper's header." Four further compressions
were measured and discarded as more expensive or as losing content: a prose-only
form with no `bash` block (+892 rather than +848 for the act), a table form, a
`suggest` call carrying the hex explicitly, and a longer decline rationale that the
helper header's `**Person:**` paragraph already covers.

The step names exactly three ways to pay and forbids two of them: never by removing
a branch, never by editing a baseline. The third — relocating prose into
`bin/fusion-checkout-name`'s header and citing it — is the one the dispatch closed
("Do not touch `bin/`"). With every sanctioned payment unavailable, the dispatch's
own instruction applies: stop and report rather than proceed. No byte of
`skills/setup/SKILL.md` was changed.

## What the roster offer would relocate

For whoever re-dispatches this: the ~275 bytes have to come out of the act's
prose, and the paragraph that would move into the helper header is the roster
offer's mechanics — what a caller presents (each distinct `**Person:**` the roster
holds, this checkout's git identity, or a typed name; the suggested alias or a
typed one) and why declining every part still registers. The refresh semantics and
the collision wording are already in that header and are cited rather than
restated.

## Acceptance criterion that was run

`./bin/fusion-checkout-name register --alias west-harbor --person "Kai Stalmann"`
in this tree, then a bare `register`:

- created `shared/checkouts/5e8248d7.md`, `action=created`, exit 0
- the refresh printed `action=refreshed`, exit 0, and added `**Refreshed:**`
- the entry carries all six fields: `**Checkout:**`, `**Alias:**`, `**Person:**`,
  `**Git identity:**`, `**Registered:**`, `**Refreshed:**`
- `resolve 5e8248d7` prints `alias=`, `person=`, `git_identity=`, exit 0
- no `collision=` line, `roster` having been `entries=0` before the write

That file is the only tree change this task produced.

## Verification

`cd hooks && npm test` — exit 1. One suite red, `citation-sweep.test.ts`, which the
dispatch names as expected and not mine: it reports 11 bare-record rewrites across
four workbench records written by earlier steps of this Circle. Run before the
registry entry was written and again after, with the identical result, so the entry
did not cause it. 820 of 821 tests pass; 47 of 48 files pass.
