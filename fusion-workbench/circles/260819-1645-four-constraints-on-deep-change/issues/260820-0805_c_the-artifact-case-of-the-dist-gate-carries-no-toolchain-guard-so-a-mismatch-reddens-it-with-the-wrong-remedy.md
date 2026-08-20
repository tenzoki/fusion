# The artifact case of the dist gate carries no toolchain guard, so a compiler mismatch reddens it with the wrong remedy

---

`hooks/lib/__tests__/committed-dist.test.ts` runs three cases. The first asserts that the declared,
locked and installed `typescript` versions agree. The third compares the fresh compile against the
committed `hooks/dist` byte for byte. The third case guards on the two conditions the `beforeAll`
can report — `prepared.gitFailure` and `prepared.compileFailure` — and on nothing else. It does not
ask whether the first case passed.

So when the installed compiler is not the declared one, both cases go red, and the third one's
failure text says the artifact is stale and prescribes `npm run build` with `hooks/dist` committed.
Acting on that remedy commits a `dist` built by the unpinned compiler, which is worse than the state
it was meant to repair.

---

**Severity:** Medium — the gate still fails, so nothing ships silently; what is wrong is that one of
the two failures prescribes an action that makes the repository worse, and it is the more specific-
looking of the two.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `hooks/lib/__tests__/committed-dist.test.ts:217-220` (the third case, and the two guards it does carry),
`hooks/lib/__tests__/committed-dist.test.ts:238-243` (the `FIX` text)
**Cross-references:**
`shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
(the answering decision, whose named risk is exactly a compiler bump reddening the suite for no
artifact defect);
`circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`
`**Decidability:**` and the step-1 risk row

## What is claimed and what holds

The plan's `**Decidability:**` line and the commit message of `ad7ffed` both state that a mismatch
is "a separate, separately-named failure rather than a wrong answer to the question", and that a
compiler bump "reddens the toolchain case rather than the artifact case".

**Verified by reading the file.** That holds for exactly one of the two bump shapes:

- **Declared bumped, not installed** (edit `package.json`, no reinstall): case 1 fails on
  `locked`/`installed` disagreeing with `declared`; the compile still runs under the old compiler,
  so case 3 stays green. The claim holds.
- **Installed bumped** (`npm install typescript@…`, which rewrites `package.json` to a caret range):
  case 1 fails because the caret literal is not the locked version, and case 3 fails too as soon as
  the new compiler's emit differs from the committed one. The claim does not hold — both are red,
  and case 3 names the artifact.

`inference:` the second shape is derived from the code rather than executed; reproducing it means
installing a second compiler version, which this review did not do. What is verified by reading is
the load-bearing half: case 3 carries no guard on the toolchain agreement, while it does carry
guards on the two other preconditions, so the asymmetry is in the file rather than in the reasoning
about it.

## Why the message is not enough on its own

Case 1's message already says "the comparison below is meaningless until it is resolved". That is
the right sentence in the wrong place: it sits on the case a reader has to have read *first*, and a
suite run prints both failures. The mitigation is documentation where the neighbouring
preconditions got a mechanism.

## A second, smaller inaccuracy in the same file

`hooks/lib/__tests__/committed-dist.test.ts:42` states "Only then do the second and third cases
compile HEAD and compare." No case compiles: the extraction and the compile both happen in
`beforeAll`, which vitest runs before the first case. The ordering the sentence describes is the
order the *assertions* report in, not the order the work happens in. It costs nothing today — the
compile is side-effect-free outside its temp directory — but it is the sentence a later reader will
use to reason about what a toolchain mismatch does, and it says the compile is gated on the
assertion when it is not.

## Fix direction

Give the toolchain agreement the same treatment `gitFailure` and `compileFailure` already have:
compute it once (in `beforeAll`, or as a module-level helper both cases call), store it on
`prepared`, and have case 3 assert it is null first with a message saying the artifact comparison is
not evaluable until the toolchain is the pinned one. That is one field and two lines, and it makes
the three cases a chain rather than three independent assertions over one shared compile.

---
**Reconciliation 260820-0830** (reconciler, domain `code`, HEAD `04db0b0`) — **still open,
reproduces.** `hooks/lib/__tests__/committed-dist.test.ts` carries three `it()` cases — the toolchain
assertion at `:177`, the compile at `:209` and the artifact comparison at `:217` — and the compile
itself runs in `beforeAll` at `:100`. Neither of the last two consults the toolchain result, so a
compiler mismatch reaches the artifact comparison and its remedy text. The file was re-run by this
pass and is green in 3.7 s. Marker unchanged.

---
Resolved: the toolchain read runs first and both later cases assert its agreement before their own, through one message that names the toolchain and prescribes no rebuild. **Both cases were guarded, not only the one this record names**: the case before it prescribed fixing the source under a wrong compiler, which is the same wrong remedy one case over, and the record asks for a chain. Demonstrated with a faked 5.9.4 compiler whose emit differs: before, the artifact case printed that the committed dist is not the compilation of the committed source with `FIX: run npm run build`; after, it prints the toolchain sentence and `Do NOT run npm run build on this failure`. The separation decision `260816-0719` demanded now holds in both directions.
